import { FormField } from '../../domain/models/FormField';

interface Props {
  title: string;
  description: string;
  fields: FormField[];
}

export function FormPreview({ title, description, fields }: Props) {
  return (
    <div className="ftx-card overflow-hidden">
      <div className="ftx-form-header px-5 py-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-white/70">Preview</div>
          <h2 className="font-display font-bold text-lg leading-tight truncate">
            {title || 'Nuevo formulario'}
          </h2>
        </div>
        <div className="hidden sm:block bg-white/10 rounded px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/80">
          en vivo
        </div>
      </div>

      <div className="p-5 bg-white">
        {description && <p className="text-sm text-ink-2 mb-4">{description}</p>}

        {fields.length === 0 ? (
          <div className="ftx-drop-zone p-10 text-center text-muted text-sm">
            Aun no hay campos. Arrastra desde la paleta para empezar.
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field) => (
              <FieldRender key={`${field.fieldKey}-${field.position}`} field={field} />
            ))}

            <button
              type="button"
              disabled
              className="ftx-btn ftx-btn-primary w-full mt-4 cursor-default"
            >
              Enviar solicitud
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldRender({ field }: { field: FormField }) {
  const label = (
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-ink-2">
        {field.label}
        {field.required && <span className="text-brand ml-1">*</span>}
      </span>
    </div>
  );

  const help = field.helpText && <p className="mt-1 text-xs text-muted">{field.helpText}</p>;

  switch (field.fieldType) {
    case 'TEXTAREA':
      return <div>{label}<textarea className="ftx-input" rows={3} placeholder={field.placeholder ?? ''} disabled />{help}</div>;
    case 'SELECT':
      return (
        <div>{label}
          <select className="ftx-input" disabled>
            <option>—</option>
            {field.optionsList().map((o) => <option key={o}>{o}</option>)}
          </select>
          {help}
        </div>
      );
    case 'MULTI_SELECT':
      return (
        <div>{label}
          <div className="flex flex-wrap gap-2">
            {field.optionsList().map((o) => <span key={o} className="ftx-tag ftx-tag-info">{o}</span>)}
            {field.optionsList().length === 0 && <span className="text-xs text-muted">Sin opciones</span>}
          </div>
          {help}
        </div>
      );
    case 'RADIO':
      return (
        <div>{label}
          <div className="space-y-1.5">
            {field.optionsList().map((o) => (
              <label key={o} className="flex items-center gap-2 text-sm">
                <input type="radio" disabled className="accent-brand" />{o}
              </label>
            ))}
          </div>
          {help}
        </div>
      );
    case 'CHECKBOX':
      return (
        <label className="flex items-center gap-2">
          <input type="checkbox" disabled className="accent-brand" />
          <span className="text-sm">{field.label}{field.required && <span className="text-brand ml-1">*</span>}</span>
        </label>
      );
    case 'FILE':
      return (
        <div>{label}
          <div className="ftx-drop-zone p-6 text-center text-muted text-sm">
            Haga clic o arrastre archivos aqui
          </div>
          {help}
        </div>
      );
    case 'DATE':
      return <div>{label}<input type="date" className="ftx-input" disabled />{help}</div>;
    case 'DATETIME':
      return <div>{label}<input type="datetime-local" className="ftx-input" disabled />{help}</div>;
    case 'NUMBER':
      return <div>{label}<input type="number" className="ftx-input" placeholder={field.placeholder ?? ''} disabled />{help}</div>;
    case 'EMAIL':
      return <div>{label}<input type="email" className="ftx-input" placeholder={field.placeholder ?? ''} disabled />{help}</div>;
    case 'URL':
      return <div>{label}<input type="url" className="ftx-input" placeholder={field.placeholder ?? ''} disabled />{help}</div>;
    case 'PHONE':
      return <div>{label}<input type="tel" className="ftx-input" placeholder={field.placeholder ?? ''} disabled />{help}</div>;
    case 'SIGNATURE':
      return <div>{label}<div className="ftx-input h-20 grid place-items-center text-muted italic">Firma aqui</div>{help}</div>;
    default:
      return <div>{label}<input className="ftx-input" placeholder={field.placeholder ?? ''} disabled />{help}</div>;
  }
}
