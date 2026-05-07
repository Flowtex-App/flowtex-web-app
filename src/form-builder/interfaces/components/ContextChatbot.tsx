import { useEffect, useRef, useState } from 'react';
import {
  Bot, X, Send, Sparkles, Plus, MessageSquare, ChevronDown,
} from 'lucide-react';
import { useFormsStore } from '../stores/forms.store';
import {
  FormField, slugifyFieldKey, type PageId,
} from '../../domain/models/FormField';
import { FIELD_TYPE_META, type FieldType } from '../../domain/models/FieldType';

type Msg =
  | { kind: 'user'; text: string; ts: number }
  | { kind: 'bot';  text: string; ts: number }
  | { kind: 'suggestions'; items: { label: string; fieldKey: string; fieldType: FieldType; rationale?: string }[]; ts: number };

interface Props {
  formTitle: string;
  context: string;
  onContextChange: (next: string) => void;
  existingKeys: Set<string>;
  activePage: PageId;
  onPick: (field: FormField) => void;
}

export function ContextChatbot({
  formTitle, context, onContextChange,
  existingKeys, activePage, onPick,
}: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => bootMessages(context));
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { suggestFields, suggesting, suggestionError } = useFormsStore();

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const now = Date.now();
    const newCtx = context ? `${context}\n${text}` : text;
    onContextChange(newCtx);
    setMessages((m) => [
      ...m,
      { kind: 'user', text, ts: now },
      {
        kind: 'bot',
        text: 'Anotado en el contexto. Cuando quieras puedo proponer campos relevantes — usa "Generar campos".',
        ts: now + 1,
      },
    ]);
  };

  const generate = async () => {
    if (!context.trim() && !formTitle.trim()) {
      setMessages((m) => [
        ...m,
        {
          kind: 'bot',
          text: 'Necesito un poco más de contexto. Cuéntame qué proceso captura este formulario y qué datos esperas recibir.',
          ts: Date.now(),
        },
      ]);
      return;
    }
    await suggestFields({ formTitle, formContext: context, maxSuggestions: 6 });
    const suggestions = useFormsStore.getState().suggestions;
    setMessages((m) => [
      ...m,
      {
        kind: 'bot',
        text:
          suggestions.length > 0
            ? `Te sugiero ${suggestions.length} campo${suggestions.length === 1 ? '' : 's'} para esta página. Toca cualquiera para insertarlo.`
            : 'No logré generar sugerencias. Intenta enriquecer el contexto.',
        ts: Date.now(),
      },
      ...(suggestions.length > 0
        ? ([
            {
              kind: 'suggestions' as const,
              items: suggestions.map((s) => ({
                label: s.label,
                fieldKey: s.fieldKey,
                fieldType: s.fieldType as FieldType,
                rationale: s.rationale,
              })),
              ts: Date.now() + 1,
            },
          ])
        : []),
    ]);
  };

  const insertSuggestion = (sugg: { label: string; fieldKey: string; fieldType: FieldType }) => {
    let key = slugifyFieldKey(sugg.fieldKey || sugg.label);
    let n = 1;
    while (existingKeys.has(key)) {
      key = `${slugifyFieldKey(sugg.fieldKey || sugg.label)}_${n++}`;
    }
    onPick(
      new FormField({
        label: sugg.label,
        fieldKey: key,
        fieldType: sugg.fieldType,
        required: false,
        position: 0,
      }).with({ page: activePage }),
    );
    setMessages((m) => [
      ...m,
      {
        kind: 'bot',
        text: `Listo: agregué "${sugg.label}" en ${activePage}.`,
        ts: Date.now(),
      },
    ]);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="ftx-bot-bubble"
        aria-label="Abrir asistente"
        title="Asistente de contexto"
      >
        <Bot size={22} />
      </button>
    );
  }

  return (
    <div className="ftx-bot-window">
      <header
        className="px-3 py-2.5 flex items-center gap-2 shrink-0"
        style={{
          background: 'var(--ftx-deep)',
          color: '#fff',
          borderBottom: '2px solid var(--ftx-ink)',
        }}
      >
        <div
          className="size-7 rounded grid place-items-center"
          style={{ background: 'var(--ftx-brand)' }}
        >
          <Sparkles size={13} className="text-white" />
        </div>
        <div className="leading-tight flex-1 min-w-0">
          <div className="font-display font-bold text-[13px] text-white">
            Asistente FLOWTEX
          </div>
          <div className="text-[9px] font-mono uppercase tracking-widest text-white/55">
            contexto + sugerencias IA
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="ftx-icon-btn !text-white/70 hover:!text-white hover:!bg-white/10 hover:!border-white/20"
          aria-label="Minimizar"
          title="Minimizar"
        >
          <ChevronDown size={14} />
        </button>
        <button
          onClick={() => setOpen(false)}
          className="ftx-icon-btn !text-white/70 hover:!text-white hover:!bg-white/10 hover:!border-white/20"
          aria-label="Cerrar"
        >
          <X size={14} />
        </button>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2"
        style={{ background: 'var(--ftx-paper)' }}
      >
        {messages.map((m, i) =>
          m.kind === 'user' ? (
            <div key={i} className="ftx-bot-msg-user">{m.text}</div>
          ) : m.kind === 'bot' ? (
            <div key={i} className="ftx-bot-msg-bot">{m.text}</div>
          ) : (
            <div key={i} className="space-y-1.5 my-1">
              {m.items.map((s) => {
                const exists = existingKeys.has(slugifyFieldKey(s.fieldKey));
                const meta = FIELD_TYPE_META[s.fieldType];
                return (
                  <button
                    key={s.fieldKey}
                    onClick={() => insertSuggestion(s)}
                    className="w-full text-left ftx-tile p-2 hover:ftx-tile-active group"
                  >
                    <div className="flex items-start gap-2">
                      <span className="ftx-chip-glyph !w-6 !h-6 !text-[10px] shrink-0">
                        {meta.glyph}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-medium text-[12px] text-ink truncate">
                            {s.label}
                          </span>
                          <span className="ftx-tag-flat shrink-0 !text-[9px]">{s.fieldType}</span>
                        </div>
                        <code className="text-[9px] font-mono text-muted block mt-0.5 truncate">
                          {s.fieldKey}
                        </code>
                        {s.rationale && (
                          <p className="text-[10px] text-ink-2 mt-1 leading-snug line-clamp-2">
                            {s.rationale}
                          </p>
                        )}
                      </div>
                      <Plus size={12} className="text-brand shrink-0 mt-0.5" />
                    </div>
                    {exists && (
                      <div className="text-[9px] mt-1 text-warning font-mono uppercase tracking-wider">
                        ya existe · se duplicará
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ),
        )}
        {suggesting && (
          <div className="ftx-bot-msg-bot">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={11} className="animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest">pensando...</span>
            </span>
          </div>
        )}
        {suggestionError && (
          <div className="ftx-bot-msg-bot" style={{ borderColor: 'var(--ftx-brand)', color: 'var(--ftx-brand-deep)' }}>
            {suggestionError}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div
        className="px-3 py-2 shrink-0 flex items-center gap-1.5"
        style={{
          background: 'var(--ftx-cream)',
          borderTop: '1px solid var(--ftx-line)',
        }}
      >
        <button
          onClick={generate}
          disabled={suggesting}
          className="ftx-btn ftx-btn-primary !py-1 !px-2 !text-[11px] flex-1"
        >
          <Sparkles size={11} /> Generar campos
        </button>
        <button
          onClick={() => {
            onContextChange('');
            setMessages(bootMessages(''));
          }}
          className="ftx-btn ftx-btn-ghost !py-1 !px-2 !text-[11px]"
          title="Limpiar contexto"
        >
          Limpiar
        </button>
      </div>

      {/* Input */}
      <div
        className="p-2 flex items-end gap-1.5 shrink-0"
        style={{
          background: 'var(--ftx-paper)',
          borderTop: '1px solid var(--ftx-line)',
        }}
      >
        <MessageSquare size={14} className="mb-2 text-muted shrink-0" />
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Describe el proceso, los actores, los datos..."
          className="ftx-input-flat resize-none text-[12px] py-1.5 max-h-24"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="ftx-btn ftx-btn-primary !py-1.5 !px-2 shrink-0"
          aria-label="Enviar"
        >
          <Send size={12} />
        </button>
      </div>
    </div>
  );
}

function bootMessages(existingContext: string): Msg[] {
  if (existingContext.trim()) {
    return [
      {
        kind: 'bot',
        text:
          'Hola. Veo que ya tienes contexto cargado. Cuando quieras pulsa "Generar campos" para que proponga campos relevantes, o agrega más detalle escribiendo abajo.',
        ts: Date.now(),
      },
    ];
  }
  return [
    {
      kind: 'bot',
      text:
        'Hola. Soy tu asistente para construir el formulario. Cuéntame qué proceso quieres capturar (ej. "Solicitud de acceso a sistemas internos para nuevos empleados") y luego puedo proponer los campos.',
      ts: Date.now(),
    },
  ];
}
