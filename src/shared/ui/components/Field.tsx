import {
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

interface BaseProps {
  label: string;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
  required?: boolean;
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;
type SelectProps = BaseProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: { value: string; label: string }[];
  };

function Header({ label, required, trailing }: { label: string; required?: boolean; trailing?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-ink-2">
        {label}
        {required && <span className="text-brand ml-0.5">*</span>}
      </span>
      {trailing}
    </div>
  );
}

function Footer({ hint, error }: { hint?: string; error?: string }) {
  if (error) return <p className="mt-1 text-xs text-brand font-medium">{error}</p>;
  if (hint) return <p className="mt-1 text-xs text-muted">{hint}</p>;
  return null;
}

export function TextField({ label, error, hint, trailing, required, className = '', ...rest }: InputProps) {
  return (
    <label className="block">
      <Header label={label} required={required} trailing={trailing} />
      <input {...rest} required={required} className={`ftx-input ${className}`} />
      <Footer hint={hint} error={error} />
    </label>
  );
}

export function TextAreaField({ label, error, hint, trailing, required, className = '', ...rest }: TextareaProps) {
  return (
    <label className="block">
      <Header label={label} required={required} trailing={trailing} />
      <textarea {...rest} required={required} className={`ftx-input resize-y ${className}`} rows={rest.rows ?? 4} />
      <Footer hint={hint} error={error} />
    </label>
  );
}

export function SelectField({ label, error, hint, trailing, required, options, className = '', ...rest }: SelectProps) {
  return (
    <label className="block">
      <Header label={label} required={required} trailing={trailing} />
      <select {...rest} required={required} className={`ftx-input ${className}`}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <Footer hint={hint} error={error} />
    </label>
  );
}
