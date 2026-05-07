import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ChevronUp, Settings2 } from 'lucide-react';
import { FormField, slugifyFieldKey } from '../../domain/models/FormField';
import { FIELD_TYPES, FIELD_TYPE_META, type FieldType } from '../../domain/models/FieldType';

interface Props {
  field: FormField;
  index: number;
  onChange: (next: FormField) => void;
  onDelete: () => void;
}

export function FieldEditor({ field, index, onChange, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  const sortableId = field.id ? `field:${field.id}` : `field:tmp-${field.fieldKey}-${index}`;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

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

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'ftx-canvas-field group',
        isDragging ? 'shadow-lg shadow-black/15 ring-2 ring-brand opacity-90' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-line bg-surface-2 rounded-t-md">
        <button
          {...attributes}
          {...listeners}
          className="size-7 grid place-items-center text-muted hover:text-ink cursor-grab active:cursor-grabbing"
          aria-label="Reordenar"
        >
          <GripVertical size={15} />
        </button>

        <span className="size-7 shrink-0 rounded bg-brand-tint border border-brand/20 grid place-items-center text-brand-deep text-xs font-semibold">
          {meta.glyph}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-ink truncate">{field.label || 'Sin etiqueta'}</span>
            {field.required && <span className="text-brand text-xs">*</span>}
          </div>
          <code className="text-[10px] font-mono text-muted truncate block">{field.fieldKey}</code>
        </div>

        <span className="ftx-tag ftx-tag-muted hidden sm:inline-flex">{meta.label}</span>

        <button
          onClick={() => setOpen(!open)}
          className="ftx-btn ftx-btn-ghost p-1.5"
          aria-label={open ? 'Cerrar propiedades' : 'Editar propiedades'}
          title="Propiedades"
        >
          {open ? <ChevronUp size={14} /> : <Settings2 size={14} />}
        </button>
        <button
          onClick={onDelete}
          className="ftx-btn ftx-btn-ghost p-1.5 hover:bg-brand-soft hover:text-brand"
          aria-label="Eliminar"
          title="Eliminar"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Inline preview */}
      <div className="p-4 border-b border-line bg-white">
        <FieldInlinePreview field={field} />
      </div>

      {open && (
        <div className="p-4 bg-surface-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Etiqueta</span>
            <input
              value={field.label}
              onChange={(e) => {
                const label = e.target.value;
                const wasAuto = field.fieldKey === slugifyFieldKey(field.label);
                update({
                  label,
                  fieldKey: wasAuto ? slugifyFieldKey(label) : field.fieldKey,
                });
              }}
              className="ftx-input mt-1 text-sm py-1.5"
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Clave</span>
            <input
              value={field.fieldKey}
              onChange={(e) => update({ fieldKey: slugifyFieldKey(e.target.value) })}
              className="ftx-input mt-1 text-sm py-1.5 font-mono"
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Tipo</span>
            <select
              value={field.fieldType}
              onChange={(e) => update({ fieldType: e.target.value as FieldType })}
              className="ftx-input mt-1 text-sm py-1.5"
            >
              {FIELD_TYPES.map((t) => <option key={t} value={t}>{FIELD_TYPE_META[t].label}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Placeholder</span>
            <input
              value={field.placeholder ?? ''}
              onChange={(e) => update({ placeholder: e.target.value })}
              className="ftx-input mt-1 text-sm py-1.5"
              placeholder="Opcional"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Texto de ayuda</span>
            <input
              value={field.helpText ?? ''}
              onChange={(e) => update({ helpText: e.target.value })}
              className="ftx-input mt-1 text-sm py-1.5"
              placeholder="Mostrado debajo del campo"
            />
          </label>

          {meta.supportsOptions && (
            <label className="block md:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Opciones (JSON o coma)
              </span>
              <input
                value={field.options ?? ''}
                onChange={(e) => update({ options: e.target.value })}
                className="ftx-input mt-1 text-sm py-1.5 font-mono"
                placeholder='["Opcion 1","Opcion 2"]'
              />
            </label>
          )}

          <label className="flex items-center gap-2 mt-1 md:col-span-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => update({ required: e.target.checked })}
              className="size-4 accent-brand"
            />
            <span className="text-sm">Campo obligatorio</span>
          </label>
        </div>
      )}
    </div>
  );
}

function FieldInlinePreview({ field }: { field: FormField }) {
  const label = (
    <div className="text-xs font-medium text-ink-2 mb-1">
      {field.label || 'Sin etiqueta'}
      {field.required && <span className="text-brand ml-1">*</span>}
    </div>
  );

  switch (field.fieldType) {
    case 'TEXTAREA':
      return <div>{label}<textarea className="ftx-input text-sm" rows={2} placeholder={field.placeholder ?? ''} disabled /></div>;
    case 'SELECT':
      return <div>{label}<select className="ftx-input text-sm" disabled><option>—</option></select></div>;
    case 'MULTI_SELECT':
      return <div>{label}<div className="flex flex-wrap gap-1.5">
        {field.optionsList().slice(0, 4).map((o) => <span key={o} className="ftx-tag">{o}</span>)}
        {field.optionsList().length === 0 && <span className="text-xs text-muted">sin opciones</span>}
      </div></div>;
    case 'RADIO':
      return <div>{label}<div className="space-y-1.5">
        {field.optionsList().slice(0, 3).map((o) => (
          <label key={o} className="flex items-center gap-2 text-xs"><input type="radio" disabled /> {o}</label>
        ))}
      </div></div>;
    case 'CHECKBOX':
      return <label className="flex items-center gap-2"><input type="checkbox" disabled className="accent-brand" /><span className="text-sm">{field.label}</span></label>;
    case 'FILE':
      return <div>{label}<div className="ftx-input text-sm border-dashed text-center text-muted">Soltar archivo aqui</div></div>;
    case 'DATE':
      return <div>{label}<input type="date" className="ftx-input text-sm" disabled /></div>;
    case 'DATETIME':
      return <div>{label}<input type="datetime-local" className="ftx-input text-sm" disabled /></div>;
    case 'NUMBER':
      return <div>{label}<input type="number" className="ftx-input text-sm" placeholder={field.placeholder ?? ''} disabled /></div>;
    case 'EMAIL':
      return <div>{label}<input type="email" className="ftx-input text-sm" placeholder={field.placeholder ?? '@'} disabled /></div>;
    case 'PHONE':
      return <div>{label}<input type="tel" className="ftx-input text-sm" placeholder={field.placeholder ?? ''} disabled /></div>;
    case 'URL':
      return <div>{label}<input type="url" className="ftx-input text-sm" placeholder={field.placeholder ?? 'https://'} disabled /></div>;
    case 'SIGNATURE':
      return <div>{label}<div className="ftx-input h-12 grid place-items-center text-muted italic text-xs">Firma aqui</div></div>;
    default:
      return <div>{label}<input className="ftx-input text-sm" placeholder={field.placeholder ?? ''} disabled /></div>;
  }
}
