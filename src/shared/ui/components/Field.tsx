import { type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

interface BaseProps {
  label: string;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextField({ label, error, hint, trailing, className = '', ...rest }: InputProps) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-mono uppercase tracking-wider text-ink/80">{label}</span>
        {trailing}
      </div>
      <input {...rest} className={`ftx-input ${className}`} />
      {hint && !error && <p className="mt-1 text-xs text-ink/60">{hint}</p>}
      {error && <p className="mt-1 text-xs text-flame font-medium">{error}</p>}
    </label>
  );
}

export function TextAreaField({ label, error, hint, trailing, className = '', ...rest }: TextareaProps) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-mono uppercase tracking-wider text-ink/80">{label}</span>
        {trailing}
      </div>
      <textarea {...rest} className={`ftx-input ${className}`} rows={rest.rows ?? 4} />
      {hint && !error && <p className="mt-1 text-xs text-ink/60">{hint}</p>}
      {error && <p className="mt-1 text-xs text-flame font-medium">{error}</p>}
    </label>
  );
}

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement>, BaseProps {
  options: { value: string; label: string }[];
}

export function SelectField({ label, error, hint, trailing, options, className = '', ...rest }: SelectProps) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-mono uppercase tracking-wider text-ink/80">{label}</span>
        {trailing}
      </div>
      <select {...rest} className={`ftx-input ${className}`}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {hint && !error && <p className="mt-1 text-xs text-ink/60">{hint}</p>}
      {error && <p className="mt-1 text-xs text-flame font-medium">{error}</p>}
    </label>
  );
}
