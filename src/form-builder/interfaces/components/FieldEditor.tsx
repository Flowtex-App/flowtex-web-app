import { GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { FormField, slugifyFieldKey } from '../../domain/models/FormField';
import { FIELD_TYPES, FIELD_TYPE_META, type FieldType } from '../../domain/models/FieldType';

interface Props {
  field: FormField;
  index: number;
  total: number;
  onChange: (next: FormField) => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
}

export function FieldEditor({ field, index, total, onChange, onDelete, onMove }: Props) {
  const meta = FIELD_TYPE_META[field.fieldType];

  const update = (patch: Partial<{
    label: string;
    fieldKey: string;
    fieldType: FieldType;
    required: boolean;
    placeholder: string | null;
    helpText: string | null;
    options: string | null;
  }>) => {
    onChange(field.with(patch));
  };

  return (
    <div className="ftx-card p-4 group">
      <div className="flex items-center gap-2 mb-3">
        <span className="size-8 bg-cream border-2 border-ink flex items-center justify-center font-mono text-xs">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="ftx-tag ftx-tag-citron">{meta.label}</span>
        <span className="text-xs font-mono text-ink/50 truncate flex-1">{field.fieldKey}</span>

        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="ftx-btn ftx-btn-ghost p-1 size-7 disabled:opacity-30"
            title="Subir"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="ftx-btn ftx-btn-ghost p-1 size-7 disabled:opacity-30"
            title="Bajar"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={onDelete}
            className="ftx-btn ftx-btn-ghost p-1 size-7 hover:bg-flame hover:text-paper"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <GripVertical size={14} className="text-ink/30" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink/70">Etiqueta</span>
          <input
            value={field.label}
            onChange={(e) => {
              const label = e.target.value;
              update({
                label,
                fieldKey: field.fieldKey === slugifyFieldKey(field.label) ? slugifyFieldKey(label) : field.fieldKey,
              });
            }}
            className="ftx-input mt-1 text-sm py-2"
          />
        </label>

        <label className="block">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink/70">Clave (key)</span>
          <input
            value={field.fieldKey}
            onChange={(e) => update({ fieldKey: slugifyFieldKey(e.target.value) })}
            className="ftx-input mt-1 text-sm py-2 font-mono"
          />
        </label>

        <label className="block">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink/70">Tipo</span>
          <select
            value={field.fieldType}
            onChange={(e) => update({ fieldType: e.target.value as FieldType })}
            className="ftx-input mt-1 text-sm py-2"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>{FIELD_TYPE_META[t].label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink/70">Placeholder</span>
          <input
            value={field.placeholder ?? ''}
            onChange={(e) => update({ placeholder: e.target.value })}
            className="ftx-input mt-1 text-sm py-2"
            placeholder="Opcional"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink/70">Ayuda</span>
          <input
            value={field.helpText ?? ''}
            onChange={(e) => update({ helpText: e.target.value })}
            className="ftx-input mt-1 text-sm py-2"
            placeholder="Texto de ayuda mostrado debajo"
          />
        </label>

        {meta.supportsOptions && (
          <label className="block md:col-span-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink/70">
              Opciones (separadas por coma o JSON)
            </span>
            <input
              value={field.options ?? ''}
              onChange={(e) => update({ options: e.target.value })}
              className="ftx-input mt-1 text-sm py-2 font-mono"
              placeholder='Ej: ["Opcion 1","Opcion 2"]'
            />
          </label>
        )}

        <label className="flex items-center gap-2 mt-1 md:col-span-2">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => update({ required: e.target.checked })}
            className="size-4 border-2 border-ink"
          />
          <span className="text-sm font-medium">Campo obligatorio</span>
        </label>
      </div>
    </div>
  );
}
