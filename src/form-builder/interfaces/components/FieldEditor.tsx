import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Settings2, ChevronUp, Maximize2 } from 'lucide-react';
import {
  FormField, slugifyFieldKey, WIDTH_PRESETS, widthClassName, type FieldWidth,
} from '../../domain/models/FormField';
import { FIELD_TYPES, FIELD_TYPE_META, type FieldType } from '../../domain/models/FieldType';

interface Props {
  field: FormField;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onChange: (next: FormField) => void;
  onDelete: () => void;
}

export function FieldEditor({ field, index, selected, onSelect, onChange, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  const sortableId = field.id ? `field:${field.id}` : `field:tmp-${field.fieldKey}-${index}`;
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
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
    width: FieldWidth;
  }>) => onChange(field.with(patch));

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={[
        widthClassName(field.width),
        'ftx-canvas-field',
        selected ? 'ftx-canvas-field-active' : '',
        isDragging ? 'shadow-xl ring-2 ring-brand opacity-90' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b-2 border-line bg-cream rounded-t-md">
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="size-6 grid place-items-center text-muted hover:text-ink cursor-grab active:cursor-grabbing"
          aria-label="Reordenar"
          title="Arrastrar para reordenar"
        >
          <GripVertical size={13} />
        </button>

        <span className="size-6 shrink-0 rounded bg-brand/10 grid place-items-center text-brand text-xs font-bold">
          {meta.glyph}
        </span>

        <span className="text-xs font-medium text-ink truncate flex-1 min-w-0">
          {field.label || 'Sin etiqueta'}
          {field.required && <span className="text-brand ml-0.5">*</span>}
        </span>

        <WidthSelector
          value={field.width}
          onChange={(w) => update({ width: w })}
        />

        <button
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
          className="size-6 grid place-items-center text-muted hover:text-ink"
          title="Propiedades"
          aria-label="Propiedades"
        >
          {open ? <ChevronUp size={13} /> : <Settings2 size={13} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="size-6 grid place-items-center text-muted hover:text-brand"
          title="Eliminar"
          aria-label="Eliminar"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="p-2.5 bg-paper">
        <FieldInlinePreview field={field} />
      </div>

      {open && (
        <div className="p-3 bg-cream border-t-2 border-line grid grid-cols-2 gap-2.5 text-xs">
          <label className="block">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Etiqueta</span>
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
              className="ftx-input mt-0.5 text-xs py-1"
              onClick={(e) => e.stopPropagation()}
            />
          </label>

          <label className="block">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Clave</span>
            <input
              value={field.fieldKey}
              onChange={(e) => update({ fieldKey: slugifyFieldKey(e.target.value) })}
              className="ftx-input mt-0.5 text-xs py-1 font-mono"
              onClick={(e) => e.stopPropagation()}
            />
          </label>

          <label className="block">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Tipo</span>
            <select
              value={field.fieldType}
              onChange={(e) => update({ fieldType: e.target.value as FieldType })}
              className="ftx-input mt-0.5 text-xs py-1"
              onClick={(e) => e.stopPropagation()}
            >
              {FIELD_TYPES.map((t) => <option key={t} value={t}>{FIELD_TYPE_META[t].label}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Placeholder</span>
            <input
              value={field.placeholder ?? ''}
              onChange={(e) => update({ placeholder: e.target.value })}
              className="ftx-input mt-0.5 text-xs py-1"
              placeholder="Opcional"
              onClick={(e) => e.stopPropagation()}
            />
          </label>

          <label className="block col-span-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Texto de ayuda</span>
            <input
              value={field.helpText ?? ''}
              onChange={(e) => update({ helpText: e.target.value })}
              className="ftx-input mt-0.5 text-xs py-1"
              placeholder="Mostrado debajo del campo"
              onClick={(e) => e.stopPropagation()}
            />
          </label>

          {meta.supportsOptions && (
            <label className="block col-span-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted">
                Opciones (JSON o coma)
              </span>
              <input
                value={field.options ?? ''}
                onChange={(e) => update({ options: e.target.value })}
                className="ftx-input mt-0.5 text-xs py-1 font-mono"
                placeholder='["A","B","C"]'
                onClick={(e) => e.stopPropagation()}
              />
            </label>
          )}

          <label className="flex items-center gap-2 col-span-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => update({ required: e.target.checked })}
              className="size-3.5 accent-brand"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-xs">Campo obligatorio</span>
          </label>
        </div>
      )}
    </div>
  );
}

function WidthSelector({ value, onChange }: { value: FieldWidth; onChange: (w: FieldWidth) => void }) {
  return (
    <div className="hidden sm:flex items-center gap-1 rounded border-2 border-line bg-paper px-1 py-0.5">
      <Maximize2 size={10} className="text-muted" />
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as FieldWidth)}
        onClick={(e) => e.stopPropagation()}
        className="text-[10px] font-mono bg-transparent border-0 outline-none cursor-pointer pr-0.5"
        title="Ancho en grid (12 cols)"
      >
        {WIDTH_PRESETS.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
    </div>
  );
}

function FieldInlinePreview({ field }: { field: FormField }) {
  const help = field.helpText && (
    <p className="mt-1 text-[10px] text-muted line-clamp-1">{field.helpText}</p>
  );

  switch (field.fieldType) {
    case 'TEXTAREA':
      return <><textarea className="ftx-input text-xs py-1.5" rows={2} placeholder={field.placeholder ?? ''} disabled />{help}</>;
    case 'SELECT':
      return <><select className="ftx-input text-xs py-1.5" disabled><option>—</option></select>{help}</>;
    case 'MULTI_SELECT':
      return (
        <>
          <div className="flex flex-wrap gap-1">
            {field.optionsList().slice(0, 3).map((o) => <span key={o} className="ftx-tag ftx-tag-muted text-[9px] py-0">{o}</span>)}
            {field.optionsList().length === 0 && <span className="text-[10px] text-muted italic">sin opciones</span>}
          </div>
          {help}
        </>
      );
    case 'RADIO':
      return (
        <>
          <div className="space-y-1">
            {field.optionsList().slice(0, 2).map((o) => (
              <label key={o} className="flex items-center gap-1.5 text-[11px]"><input type="radio" disabled className="size-3" /> {o}</label>
            ))}
            {field.optionsList().length === 0 && <span className="text-[10px] text-muted italic">sin opciones</span>}
          </div>
          {help}
        </>
      );
    case 'CHECKBOX':
      return <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" disabled className="size-3.5 accent-brand" />{field.label}</label>;
    case 'FILE':
      return <div className="ftx-input text-[10px] py-2 border-dashed text-center text-muted italic">Soltar archivo</div>;
    case 'DATE':
      return <><input type="date" className="ftx-input text-xs py-1.5" disabled />{help}</>;
    case 'DATETIME':
      return <><input type="datetime-local" className="ftx-input text-xs py-1.5" disabled />{help}</>;
    case 'NUMBER':
      return <><input type="number" className="ftx-input text-xs py-1.5" placeholder={field.placeholder ?? '0'} disabled />{help}</>;
    case 'EMAIL':
      return <><input type="email" className="ftx-input text-xs py-1.5" placeholder={field.placeholder ?? '@'} disabled />{help}</>;
    case 'URL':
      return <><input type="url" className="ftx-input text-xs py-1.5" placeholder={field.placeholder ?? 'https://'} disabled />{help}</>;
    case 'PHONE':
      return <><input type="tel" className="ftx-input text-xs py-1.5" placeholder={field.placeholder ?? ''} disabled />{help}</>;
    case 'SIGNATURE':
      return <div className="ftx-input h-10 grid place-items-center text-muted italic text-[10px]">Firma</div>;
    default:
      return <><input className="ftx-input text-xs py-1.5" placeholder={field.placeholder ?? ''} disabled />{help}</>;
  }
}
