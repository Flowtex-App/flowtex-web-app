import { useState } from 'react';
import { Sparkles, Plus, RefreshCw, X } from 'lucide-react';
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

  const close = () => {
    clearSuggestions();
    setOpen(false);
  };

  return (
    <div className="ftx-card overflow-hidden">
      <div className="px-4 py-3 border-b border-line bg-gradient-to-r from-brand-tint to-white flex items-center gap-2">
        <div className="size-7 rounded bg-brand grid place-items-center text-white">
          <Sparkles size={14} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-ink">Asistente IA</div>
          <div className="text-[11px] text-muted">Sugiere campos a partir de tu contexto</div>
        </div>
        {open && (
          <button onClick={close} className="ftx-btn ftx-btn-ghost p-1.5" aria-label="Cerrar">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="p-4">
        {!open ? (
          <Button onClick={onSuggest} variant="primary" size="sm" block disabled={suggesting} icon={<Sparkles size={14} />}>
            {suggesting ? 'Pensando...' : 'Generar campos con IA'}
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <Button onClick={onSuggest} size="sm" variant="primary" disabled={suggesting} icon={suggesting ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}>
                {suggesting ? 'Generando...' : 'Regenerar'}
              </Button>
              <span className="text-xs text-muted">{suggestions.length} sugerencias</span>
            </div>

            {suggestionError && (
              <div className="bg-brand-soft border border-brand/30 text-brand-deep text-xs rounded p-2 mb-3">
                {suggestionError}
              </div>
            )}

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
              {suggestions.map((s, i) => {
                const exists = existingKeys.has(slugifyFieldKey(s.fieldKey));
                return (
                  <button
                    key={`${s.fieldKey}-${i}`}
                    onClick={() => pickSuggestion(s)}
                    className="w-full text-left ftx-canvas-field p-3 hover:border-brand transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm text-ink truncate">{s.label}</span>
                      <span className="ftx-tag ftx-tag-muted text-[10px]">{s.fieldType}</span>
                    </div>
                    <code className="text-[10px] font-mono text-muted block mt-0.5">{s.fieldKey}</code>
                    {s.rationale && (
                      <p className="text-xs text-ink-2 mt-1.5 leading-snug">{s.rationale}</p>
                    )}
                    <div className="mt-2 text-[10px] uppercase font-semibold text-brand flex items-center gap-1">
                      <Plus size={10} /> {exists ? 'Anadir copia' : 'Anadir al formulario'}
                    </div>
                  </button>
                );
              })}

              {!suggesting && suggestions.length === 0 && !suggestionError && (
                <div className="text-center text-muted text-sm py-6">
                  Sin sugerencias todavia. Pulsa "Regenerar".
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
