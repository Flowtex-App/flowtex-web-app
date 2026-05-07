import { useState } from 'react';
import { Sparkles, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/components/Button';
import { useFormsStore } from '../stores/forms.store';
import { FormField, slugifyFieldKey } from '../../domain/models/FormField';
import type { FieldType } from '../../domain/models/FieldType';

interface Props {
  formTitle: string;
  formContext: string;
  existingKeys: Set<string>;
  onPick: (field: FormField) => void;
}

export function AiSuggestionPanel({ formTitle, formContext, existingKeys, onPick }: Props) {
  const { suggestions, suggesting, suggestionError, suggestFields, clearSuggestions } = useFormsStore();
  const [open, setOpen] = useState(false);

  const onSuggest = async () => {
    setOpen(true);
    await suggestFields({ formTitle, formContext, maxSuggestions: 6 });
  };

  const pickSuggestion = (sugg: { label: string; fieldKey: string; fieldType: FieldType }) => {
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
      }),
    );
  };

  return (
    <div className="ftx-card-cream p-5 relative overflow-hidden">
      <div className="absolute -top-2 -right-2 size-16 ftx-stripe opacity-30 rotate-12" />
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="ftx-tag ftx-tag-violet">ai</span>
          <h3 className="font-display font-bold text-lg mt-2">Sugerencias inteligentes</h3>
          <p className="text-xs text-ink/60 mt-0.5">Genero campos a partir del contexto.</p>
        </div>
        <button
          onClick={onSuggest}
          disabled={suggesting}
          className="ftx-btn ftx-btn-ink size-10 p-0 disabled:opacity-50"
          title="Generar sugerencias"
        >
          {suggesting ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
        </button>
      </div>

      {!open && (
        <Button onClick={onSuggest} size="sm" variant="primary" className="mt-3 w-full" disabled={suggesting}>
          {suggesting ? 'Pensando...' : 'Generar campos con IA'}
        </Button>
      )}

      {suggestionError && (
        <div className="mt-3 border-2 border-flame bg-blush p-2 text-xs">{suggestionError}</div>
      )}

      {open && suggestions.length > 0 && (
        <div className="mt-4 space-y-2 max-h-80 overflow-y-auto pr-1">
          {suggestions.map((s, i) => (
            <button
              key={`${s.fieldKey}-${i}`}
              onClick={() => pickSuggestion(s)}
              className="w-full text-left ftx-card p-3 hover:bg-citron transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-semibold text-sm">{s.label}</span>
                <span className="ftx-tag text-[10px]">{s.fieldType}</span>
              </div>
              <code className="text-[10px] font-mono text-ink/60 block mt-0.5">{s.fieldKey}</code>
              {s.rationale && (
                <p className="text-xs text-ink/70 mt-1.5 leading-relaxed">{s.rationale}</p>
              )}
              <div className="mt-2 text-[10px] font-mono uppercase text-flame flex items-center gap-1 font-semibold">
                <Plus size={10} /> Anadir al formulario
              </div>
            </button>
          ))}
          <button
            onClick={() => {
              clearSuggestions();
              setOpen(false);
            }}
            className="w-full text-xs text-ink/50 underline mt-2"
          >
            Cerrar sugerencias
          </button>
        </div>
      )}
    </div>
  );
}
