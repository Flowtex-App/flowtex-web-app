import {
  Paperclip, PenLine, User as UserIcon, BadgeCheck, Building2, Briefcase, Image as ImageIcon,
} from 'lucide-react';
import { FormField, parsePresentationalConfig } from '../../domain/models/FormField';
import { FIELD_TYPE_META } from '../../domain/models/FieldType';
import { useAuthStore } from '@/iam/interfaces/stores/auth.store';

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

  // Auto-filled blocks (resolved from current user)
  if (meta.autoFill) {
    return <AutoFillRender field={field} compact={compact} />;
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
  const cfg = parsePresentationalConfig(field.options);

  // Estilo de fondo y color de texto opcional. Si hay bg, ponemos padding
  // y border-radius para que se vea como bloque coloreado.
  const blockStyle: React.CSSProperties = {
    ...(cfg.bg ? { background: cfg.bg, padding: '12px 14px', borderRadius: 6 } : {}),
    ...(cfg.fg ? { color: cfg.fg } : {}),
  };

  switch (field.fieldType) {
    case 'HEADING':
      return (
        <div style={blockStyle}>
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted mb-0.5">
            heading
          </div>
          <h3
            className={`font-display font-bold leading-tight ${compact ? 'text-base' : 'text-xl'}`}
            style={cfg.fg ? { color: cfg.fg } : undefined}
          >
            {field.label || 'Encabezado de sección'}
          </h3>
          {field.helpText && (
            <p className="text-[11px] mt-0.5 italic font-editorial"
               style={{ color: cfg.fg ? cfg.fg : 'var(--ftx-muted)', opacity: 0.85 }}>
              {field.helpText}
            </p>
          )}
        </div>
      );
    case 'PARAGRAPH':
      return (
        <div style={blockStyle}>
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted mb-0.5">
            parrafo
          </div>
          <p
            className={`leading-relaxed whitespace-pre-line break-words ${compact ? 'text-[11px]' : 'text-sm'}`}
            style={cfg.fg ? { color: cfg.fg } : { color: 'var(--ftx-ink-2)' }}
          >
            {field.helpText || field.label || 'Texto explicativo para el usuario que llenará este formulario.'}
          </p>
        </div>
      );
    case 'SECTION':
      return (
        <div className="flex items-center gap-3 px-1 py-0.5" style={blockStyle}>
          <div className="flex-1 h-px bg-line-strong" />
          <div className="text-center">
            <div className="font-mono text-[9px] uppercase tracking-widest mb-0.5"
                 style={{ color: cfg.fg ? cfg.fg : 'var(--ftx-brand)' }}>
              § sección
            </div>
            <div className={`font-display font-bold uppercase tracking-wider ${compact ? 'text-[11px]' : 'text-sm'}`}
                 style={cfg.fg ? { color: cfg.fg } : { color: 'var(--ftx-ink)' }}>
              {field.label || 'Nueva sección'}
            </div>
          </div>
          <div className="flex-1 h-px bg-line-strong" />
        </div>
      );
    case 'DIVIDER':
      return (
        <div className="flex items-center gap-2 px-1" style={blockStyle}>
          <div className="flex-1 h-px bg-line-strong" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted">divisor</span>
          <div className="flex-1 h-px bg-line-strong" />
        </div>
      );
    case 'SPACER':
      return (
        <div
          className="grid place-items-center text-[10px] font-mono uppercase tracking-widest text-muted/60 italic h-full min-h-[36px] rounded border border-dashed border-line"
          style={{ background: cfg.bg ?? 'transparent' }}
        >
          {compact ? '◻' : '◻ espacio'}
        </div>
      );
    case 'IMAGE': {
      const src = cfg.src;
      const alt = cfg.alt || field.label || 'Imagen';
      if (src) {
        return (
          <div style={blockStyle} className="h-full w-full">
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-contain rounded"
              style={{ maxHeight: compact ? '120px' : '320px' }}
            />
            {field.helpText && (
              <p className="text-[10px] text-muted mt-1 italic"
                 style={cfg.fg ? { color: cfg.fg } : undefined}>
                {field.helpText}
              </p>
            )}
          </div>
        );
      }
      return (
        <div
          className="grid place-items-center rounded border border-dashed border-line-strong w-full h-full min-h-[100px]"
          style={{ background: cfg.bg ?? 'var(--ftx-cream)' }}
        >
          <div className="text-center">
            <ImageIcon size={compact ? 16 : 24} className="mx-auto text-muted" />
            <p className="text-[10px] text-muted mt-1 italic">
              {compact ? 'imagen' : 'Pega la URL de la imagen en el inspector'}
            </p>
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}

function AutoFillRender({ field, compact }: { field: FormField; compact: boolean }) {
  const user = useAuthStore((s) => s.user);

  let icon = <UserIcon size={12} className="text-steel" />;
  let label = field.label;
  let value = '—';

  switch (field.fieldType) {
    case 'AUTO_USER_NAME':
      icon = <UserIcon size={12} className="text-steel" />;
      value = user?.fullName ?? '— Inicia sesión para ver tu nombre —';
      if (!field.label || field.label === 'Auto') label = 'Nombre completo';
      break;
    case 'AUTO_EMPLOYEE_CODE':
      icon = <BadgeCheck size={12} className="text-steel" />;
      value = user?.employeeCode || '—';
      if (!field.label || field.label === 'Auto') label = 'Código de empleado';
      break;
    case 'AUTO_POSITION':
      icon = <Briefcase size={12} className="text-steel" />;
      value = user?.formattedPosition() || '—';
      if (!field.label || field.label === 'Auto') label = 'Cargo';
      break;
    case 'AUTO_AREA':
      icon = <Building2 size={12} className="text-steel" />;
      value = user?.areaLabel || '—';
      if (!field.label || field.label === 'Auto') label = 'Área';
      break;
  }

  return (
    <div className={compact ? '' : 'space-y-1'}>
      {!compact && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-2 truncate flex items-center gap-1">
          {label} <span className="ftx-tag-flat !text-info !border-info !text-[8px]">auto</span>
        </span>
      )}
      <div
        className="flex items-center gap-2 px-2.5 py-2 rounded text-xs"
        style={{
          background: 'var(--ftx-cream)',
          border: '1px dashed var(--ftx-line-strong)',
          color: 'var(--ftx-ink)',
        }}
      >
        {icon}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}
