import { useAuthStore } from '@/iam/interfaces/stores/auth.store';
import type { FormSnapshot, FormSnapshotField } from '../../domain/models/Submission';

interface Props {
  snapshot: FormSnapshot;
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  /** When true, inputs are disabled (read-only viewing). */
  readOnly?: boolean;
}

/**
 * Render edit-able fields según el snapshot del formulario.
 * Soporta los mismos tipos que el FieldRender del builder, pero con state real
 * (value/onChange) en lugar de previews disabled. Los AUTO_* se pintan con
 * los datos del usuario logueado y no son editables.
 */
export function FormFiller({ snapshot, values, onChange, readOnly = false }: Props) {
  const ordered = [...snapshot.fields].sort((a, b) => a.position - b.position);

  return (
    <div className="grid grid-cols-12 gap-3 auto-rows-min">
      {ordered.map((f) => (
        <div
          key={f.fieldKey}
          className={widthClass(f.width)}
          style={{
            ...(f.colStart != null ? { gridColumnStart: f.colStart } : {}),
            ...(f.rowStart != null ? { gridRowStart: f.rowStart } : {}),
            ...(f.rowSpan > 1 ? { gridRowEnd: `span ${f.rowSpan}` } : {}),
          }}
        >
          <FieldInput field={f} value={values[f.fieldKey]} onChange={(v) => onChange(f.fieldKey, v)} readOnly={readOnly} />
        </div>
      ))}
    </div>
  );
}

function FieldInput({
  field, value, onChange, readOnly,
}: {
  field: FormSnapshotField;
  value: unknown;
  onChange: (v: unknown) => void;
  readOnly: boolean;
}) {
  const meta = isPresentational(field.fieldType);

  if (meta) return <PresentationalBlock field={field} />;
  if (isAutoFill(field.fieldType)) return <AutoBlock field={field} />;

  const cls = 'ftx-input text-sm';
  const v = value == null ? '' : String(value);

  return (
    <label className="block space-y-1">
      <span className="text-[12px] font-semibold text-ink">
        {field.label} {field.required && <span className="text-brand">*</span>}
      </span>
      {renderControl(field, v, onChange, readOnly, cls)}
      {field.helpText && (
        <span className="block text-[11px] text-muted leading-snug">{field.helpText}</span>
      )}
    </label>
  );
}

function renderControl(
  field: FormSnapshotField,
  v: string,
  onChange: (v: unknown) => void,
  readOnly: boolean,
  cls: string,
) {
  const opts = parseOptions(field.options);

  switch (field.fieldType) {
    case 'TEXTAREA':
      return (
        <textarea
          value={v}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? ''}
          rows={Math.max(3, field.rowSpan * 2)}
          required={field.required}
          disabled={readOnly}
          className={`${cls} resize-y`}
        />
      );
    case 'SELECT':
      return (
        <select
          value={v}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          disabled={readOnly}
          className={cls}
        >
          <option value="">Seleccionar...</option>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    case 'MULTI_SELECT': {
      const arr: string[] = Array.isArray(v) ? v : (v ? String(v).split(',').filter(Boolean) : []);
      const toggle = (o: string) => {
        const next = arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o];
        onChange(next);
      };
      return (
        <div className="flex flex-wrap gap-1.5">
          {opts.map((o) => (
            <button
              type="button"
              key={o}
              onClick={() => !readOnly && toggle(o)}
              disabled={readOnly}
              className={[
                'px-2.5 py-1 rounded text-[11px] border transition-colors',
                arr.includes(o) ? 'border-brand bg-brand-tint text-brand-deep' : 'border-line bg-paper text-ink-2 hover:border-steel',
              ].join(' ')}
            >
              {o}
            </button>
          ))}
        </div>
      );
    }
    case 'RADIO':
      return (
        <div className="space-y-1">
          {opts.map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={field.fieldKey}
                value={o}
                checked={v === o}
                onChange={() => onChange(o)}
                required={field.required}
                disabled={readOnly}
                className="size-3.5 accent-brand"
              />
              {o}
            </label>
          ))}
        </div>
      );
    case 'CHECKBOX': {
      const checked = v === 'true' || v === '1';
      return (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={readOnly}
            className="size-4 accent-brand"
          />
          <span className="text-ink">{field.label}</span>
        </label>
      );
    }
    case 'DATE':
      return (
        <input type="date" value={v} onChange={(e) => onChange(e.target.value)}
               required={field.required} disabled={readOnly} className={cls} />
      );
    case 'DATETIME':
      return (
        <input type="datetime-local" value={v} onChange={(e) => onChange(e.target.value)}
               required={field.required} disabled={readOnly} className={cls} />
      );
    case 'NUMBER':
      return (
        <input type="number" value={v} onChange={(e) => onChange(e.target.value)}
               placeholder={field.placeholder ?? '0'}
               required={field.required} disabled={readOnly} className={cls} />
      );
    case 'EMAIL':
      return (
        <input type="email" value={v} onChange={(e) => onChange(e.target.value)}
               placeholder={field.placeholder ?? 'usuario@empresa.com'}
               required={field.required} disabled={readOnly} className={cls} />
      );
    case 'URL':
      return (
        <input type="url" value={v} onChange={(e) => onChange(e.target.value)}
               placeholder={field.placeholder ?? 'https://'}
               required={field.required} disabled={readOnly} className={cls} />
      );
    case 'PHONE':
      return (
        <input type="tel" value={v} onChange={(e) => onChange(e.target.value)}
               placeholder={field.placeholder ?? '+51 9'}
               required={field.required} disabled={readOnly} className={cls} />
      );
    case 'FILE':
      return (
        <input type="file" disabled={readOnly} className={cls}
               onChange={(e) => onChange(e.target.files?.[0]?.name ?? '')} />
      );
    case 'SIGNATURE':
      return (
        <textarea value={v} onChange={(e) => onChange(e.target.value)}
                  rows={2} placeholder="Nombre completo + DNI (firma escrita)"
                  required={field.required} disabled={readOnly}
                  className={`${cls} font-mono`} />
      );
    default:
      return (
        <input value={v} onChange={(e) => onChange(e.target.value)}
               placeholder={field.placeholder ?? ''}
               required={field.required} disabled={readOnly} className={cls} />
      );
  }
}

function PresentationalBlock({ field }: { field: FormSnapshotField }) {
  switch (field.fieldType) {
    case 'HEADING':
      return (
        <div>
          <h3 className="font-display font-bold text-xl text-ink leading-tight">
            {field.label || 'Encabezado'}
          </h3>
          {field.helpText && (
            <p className="text-[12px] text-muted mt-1 italic">{field.helpText}</p>
          )}
        </div>
      );
    case 'PARAGRAPH':
      return (
        <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-line break-words">
          {field.helpText || field.label}
        </p>
      );
    case 'SECTION':
      return (
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-line-strong" />
          <span className="font-display font-bold uppercase tracking-widest text-sm text-ink">
            {field.label}
          </span>
          <div className="flex-1 h-px bg-line-strong" />
        </div>
      );
    case 'DIVIDER':
      return <div className="h-px bg-line-strong" />;
    case 'SPACER':
      return <div className="h-full" />;
    default:
      return null;
  }
}

function AutoBlock({ field }: { field: FormSnapshotField }) {
  const user = useAuthStore((s) => s.user);
  let value = '—';
  let label = field.label;
  switch (field.fieldType) {
    case 'AUTO_USER_NAME':     value = user?.fullName ?? '—'; label = label || 'Nombre completo'; break;
    case 'AUTO_EMPLOYEE_CODE': value = user?.employeeCode ?? '—'; label = label || 'Código de empleado'; break;
    case 'AUTO_POSITION':      value = user?.formattedPosition() ?? '—'; label = label || 'Cargo'; break;
    case 'AUTO_AREA':          value = user?.areaLabel ?? '—'; label = label || 'Área'; break;
  }
  return (
    <div className="space-y-1">
      <span className="text-[12px] font-semibold text-ink flex items-center gap-1.5">
        {label}
        <span className="ftx-tag-flat !text-info !border-info !text-[8px]">auto</span>
      </span>
      <div className="px-3 py-2 rounded text-sm text-ink"
           style={{ background: 'var(--ftx-cream)', border: '1px dashed var(--ftx-line-strong)' }}>
        {value}
      </div>
    </div>
  );
}

function widthClass(w: number): string {
  const map: Record<number, string> = {
    1: 'col-span-12 sm:col-span-1',  2: 'col-span-12 sm:col-span-2',
    3: 'col-span-12 sm:col-span-3',  4: 'col-span-12 sm:col-span-4',
    5: 'col-span-12 sm:col-span-5',  6: 'col-span-12 sm:col-span-6',
    7: 'col-span-12 sm:col-span-7',  8: 'col-span-12 sm:col-span-8',
    9: 'col-span-12 sm:col-span-9', 10: 'col-span-12 sm:col-span-10',
    11: 'col-span-12 sm:col-span-11', 12: 'col-span-12',
  };
  return map[w] ?? 'col-span-12';
}

function parseOptions(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
}

const PRESENTATIONAL = new Set(['HEADING', 'PARAGRAPH', 'SECTION', 'DIVIDER', 'SPACER']);
const AUTO_FILL = new Set(['AUTO_USER_NAME', 'AUTO_EMPLOYEE_CODE', 'AUTO_POSITION', 'AUTO_AREA']);

function isPresentational(t: string): boolean { return PRESENTATIONAL.has(t); }
function isAutoFill(t: string): boolean { return AUTO_FILL.has(t); }
