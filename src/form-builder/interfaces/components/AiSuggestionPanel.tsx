import { useState } from 'react';
import { Sparkles, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/components/Button';
import { useFormsStore } from '../stores/forms.store';
import { FormField, slugifyFieldKey } from '../../domain/models/FormField';
import { FIELD_TYPE_META, type FieldType } from '../../domain/models/FieldType';

interface Props {
  formTitle: string;
  formContext: string;
  existingKeys: Set<string>;
  onPick: (field: FormField) => void;
}

export function AiSuggestionPanel({ formTitle, formContext, existingKeys, onPick }: Props) {
  const { suggestions, suggesting, suggestionError, suggestFields } = useFormsStore();
  const [hasRun, setHasRun] = useState(false);

  const onSuggest = async () => {
    setHasRun(true);
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
    <div className="flex flex-col gap-3">
      <div className="px-3 py-3 border border-line bg-cream rounded">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded bg-brand grid place-items-center text-white">
            <Sparkles size={13} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-display font-bold text-ink leading-tight">
              Asistente IA
            </div>
            <div className="text-[10px] text-muted font-mono uppercase tracking-widest">
              groq · llama 3.1
            </div>
          </div>
        </div>
        <p className="text-[11px] text-ink-2 mt-2 leading-snug">
          Genera campos relevantes a partir del titulo y el contexto del
          formulario. Cada sugerencia se inserta en el paso actual al hacer
          clic.
        </p>
        <Button
          onClick={onSuggest}
          variant="primary"
          size="sm"
          block
          disabled={suggesting}
          icon={
            suggesting ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />
          }
          className="mt-3"
        >
          {suggesting ? 'Pensando...' : hasRun ? 'Regenerar sugerencias' : 'Generar campos'}
        </Button>
      </div>

      {suggestionError && (
        <div className="bg-brand-soft border border-brand/30 text-brand-deep text-xs rounded p-2">
          {suggestionError}
        </div>
      )}

      <div className="space-y-2">
        {suggestions.map((s, i) => {
          const exists = existingKeys.has(slugifyFieldKey(s.fieldKey));
          const meta = FIELD_TYPE_META[s.fieldType];
          return (
            <button
              key={`${s.fieldKey}-${i}`}
              onClick={() => pickSuggestion(s)}
              className="w-full text-left ftx-tile hover:ftx-tile-active p-2.5 group"
            >
              <div className="flex items-start gap-2">
                <span className="ftx-chip-glyph !w-7 !h-7 shrink-0">{meta.glyph}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-[12px] text-ink truncate">
                      {s.label}
                    </span>
                    <span className="ftx-tag-flat shrink-0">{s.fieldType}</span>
                  </div>
                  <code className="text-[10px] font-mono text-muted block mt-0.5 truncate">
                    {s.fieldKey}
                  </code>
                  {s.rationale && (
                    <p className="text-[11px] text-ink-2 mt-1.5 leading-snug">
                      {s.rationale}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] uppercase font-semibold text-brand font-mono tracking-widest">
                <span className="flex items-center gap-1">
                  <Plus size={10} /> {exists ? 'añadir copia' : 'añadir al canvas'}
                </span>
                <span className="text-muted">{meta.group}</span>
              </div>
            </button>
          );
        })}

        {hasRun && !suggesting && suggestions.length === 0 && !suggestionError && (
          <div className="text-center text-muted text-xs py-6 border border-dashed border-line-strong rounded">
            La IA no genero sugerencias. Intenta enriquecer el contexto del
            formulario y vuelve a generar.
          </div>
        )}

        {!hasRun && !suggesting && suggestions.length === 0 && (
          <div className="text-center text-muted text-[11px] py-4 leading-relaxed">
            Cuando estes listo, presiona <span className="font-mono text-ink">Generar campos</span>{' '}
            y la IA leera el contexto del formulario para proponer campos.
          </div>
        )}
      </div>
    </div>
  );
}
