import { Paperclip, PenLine } from 'lucide-react';
import { FormField } from '../../domain/models/FormField';
import { FIELD_TYPE_META } from '../../domain/models/FieldType';

interface Props {
  field: FormField;
  /** Compact rendering for the canvas tile (smaller padding/text). */
  compact?: boolean;
}

export function FieldRender({ field, compact = false }: Props) {
  const meta = FIELD_TYPE_META[field.fieldType];

  // Layout / display blocks
  if (meta.presentational) {
    return <PresentationalRender field={field} compact={compact} />;
  }

  return (
    <div className={compact ? '' : 'space-y-1'}>
      {!compact && <Label field={field} />}
      <InputRender field={field} compact={compact} />
      {field.helpText && (
        <p className={compact ? 'mt-1 text-[10px] text-muted line-clamp-1' : 'mt-1 text-[10px] text-muted leading-snug'}>
          {field.helpText}
        </p>
      )}
    </div>
  );
}

function Label({ field }: { field: FormField }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-2 truncate">
        {field.label}
        {field.required && <span className="text-brand ml-0.5">*</span>}
      </span>
    </div>
  );
}

function InputRender({ field, compact }: { field: FormField; compact: boolean }) {
  const cls = compact ? 'ftx-input-flat text-xs py-1.5' : 'ftx-input text-xs py-1.5';

  switch (field.fieldType) {
    case 'TEXTAREA':
      return <textarea className={cls} rows={compact ? 2 : 3} placeholder={field.placeholder ?? ''} disabled />;
    case 'SELECT':
      return (
        <select className={cls} disabled>
          <option>—</option>
          {field.optionsList().map((o) => <option key={o}>{o}</option>)}
        </select>
      );
    case 'MULTI_SELECT':
      return (
        <div className="flex flex-wrap gap-1">
          {field.optionsList().slice(0, compact ? 3 : 8).map((o) => (
            <span key={o} className="ftx-tag-flat">{o}</span>
          ))}
          {field.optionsList().length === 0 && (
            <span className="text-[10px] text-muted italic">sin opciones</span>
          )}
        </div>
      );
    case 'RADIO':
      return (
        <div className="space-y-1">
          {field.optionsList().slice(0, compact ? 2 : 6).map((o) => (
            <label key={o} className="flex items-center gap-1.5 text-[11px]">
              <input type="radio" disabled className="size-3 accent-brand" /> {o}
            </label>
          ))}
          {field.optionsList().length === 0 && (
            <span className="text-[10px] text-muted italic">sin opciones</span>
          )}
        </div>
      );
    case 'CHECKBOX':
      return (
        <label className="flex items-center gap-1.5 text-xs">
          <input type="checkbox" disabled className="size-3.5 accent-brand" />
          <span className="text-ink">{field.label}</span>
        </label>
      );
    case 'FILE':
      return (
        <div className="flex items-center gap-2 px-2.5 py-2 border border-dashed border-line-strong rounded bg-cream text-[10px] text-muted italic">
          <Paperclip size={12} className="text-steel" />
          Soltar archivo o hacer clic
        </div>
      );
    case 'DATE':
      return <input type="date" className={cls} disabled />;
    case 'DATETIME':
      return <input type="datetime-local" className={cls} disabled />;
    case 'NUMBER':
      return <input type="number" className={cls} placeholder={field.placeholder ?? '0'} disabled />;
    case 'EMAIL':
      return <input type="email" className={cls} placeholder={field.placeholder ?? 'usuario@empresa.com'} disabled />;
    case 'URL':
      return <input type="url" className={cls} placeholder={field.placeholder ?? 'https://'} disabled />;
    case 'PHONE':
      return <input type="tel" className={cls} placeholder={field.placeholder ?? '+51 9'} disabled />;
    case 'SIGNATURE':
      return (
        <div className="flex items-center gap-2 px-2.5 py-3 border border-dashed border-line-strong rounded bg-cream text-[10px] text-muted italic">
          <PenLine size={12} className="text-steel" />
          Trazar firma
        </div>
      );
    default:
      return <input className={cls} placeholder={field.placeholder ?? ''} disabled />;
  }
}

function PresentationalRender({ field, compact }: { field: FormField; compact: boolean }) {
  switch (field.fieldType) {
    case 'HEADING':
      return (
        <div className="px-1">
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted mb-0.5">
            heading
          </div>
          <h3 className={`font-display font-bold text-ink leading-tight ${compact ? 'text-base' : 'text-xl'}`}>
            {field.label || 'Encabezado de seccion'}
          </h3>
          {field.helpText && (
            <p className="text-[11px] text-muted mt-0.5 italic font-editorial">
              {field.helpText}
            </p>
          )}
        </div>
      );
    case 'PARAGRAPH':
      return (
        <div className="px-1">
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted mb-0.5">
            parrafo
          </div>
          <p className={`text-ink-2 leading-relaxed ${compact ? 'text-[11px]' : 'text-sm'}`}>
            {field.helpText || field.label || 'Texto explicativo para el usuario que llenara este formulario.'}
          </p>
        </div>
      );
    case 'SECTION':
      return (
        <div className="flex items-center gap-3 px-1 py-0.5">
          <div className="flex-1 h-px bg-line-strong" />
          <div className="text-center">
            <div className="font-mono text-[9px] uppercase tracking-widest text-brand mb-0.5">
              § seccion
            </div>
            <div className={`font-display font-bold uppercase tracking-wider text-ink ${compact ? 'text-[11px]' : 'text-sm'}`}>
              {field.label || 'Nueva seccion'}
            </div>
          </div>
          <div className="flex-1 h-px bg-line-strong" />
        </div>
      );
    case 'DIVIDER':
      return (
        <div className="flex items-center gap-2 px-1">
          <div className="flex-1 h-px bg-line-strong" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted">divisor</span>
          <div className="flex-1 h-px bg-line-strong" />
        </div>
      );
    default:
      return null;
  }
}
