import { FormField, widthClassName } from '../../domain/models/FormField';

interface Props {
  title: string;
  description: string;
  fields: FormField[];
}

export function FormPreview({ title, description, fields }: Props) {
  return (
    <div className="ftx-card overflow-hidden">
      <div className="ftx-form-header px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[9px] font-bold uppercase tracking-widest text-white/70">Preview en vivo</div>
          <h2 className="font-display font-bold text-base leading-tight truncate">
            {title || 'Nuevo formulario'}
          </h2>
        </div>
        <span className="ftx-tag bg-white text-brand border-white text-[9px]">12 cols</span>
      </div>

      <div className="p-4 bg-paper">
        {description && <p className="text-xs text-ink-2 mb-3 leading-snug">{description}</p>}

        {fields.length === 0 ? (
          <div className="ftx-drop-zone p-8 text-center text-muted text-xs">
            Aun no hay campos. El preview se actualiza solo conforme construyes.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-2">
              {fields.map((field) => (
                <div key={`${field.fieldKey}-${field.position}`} className={widthClassName(field.width)}>
                  <FieldRender field={field} />
                </div>
              ))}
            </div>

            <button
              type="button"
              disabled
              className="ftx-btn ftx-btn-primary w-full mt-4 text-xs"
            >
              Enviar solicitud
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function FieldRender({ field }: { field: FormField }) {
  const label = (
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-2 truncate">
        {field.label}
        {field.required && <span className="text-brand ml-0.5">*</span>}
      </span>
    </div>
  );

  const help = field.helpText && <p className="mt-1 text-[10px] text-muted leading-snug">{field.helpText}</p>;

  switch (field.fieldType) {
    case 'TEXTAREA':
      return <div>{label}<textarea className="ftx-input text-xs py-1.5" rows={2} placeholder={field.placeholder ?? ''} disabled />{help}</div>;
    case 'SELECT':
      return (
        <div>{label}
          <select className="ftx-input text-xs py-1.5" disabled>
            <option>—</option>
            {field.optionsList().map((o) => <option key={o}>{o}</option>)}
          </select>
          {help}
        </div>
      );
    case 'MULTI_SELECT':
      return (
        <div>{label}
          <div className="flex flex-wrap gap-1">
            {field.optionsList().map((o) => <span key={o} className="ftx-tag ftx-tag-info text-[9px]">{o}</span>)}
            {field.optionsList().length === 0 && <span className="text-[10px] text-muted italic">sin opciones</span>}
          </div>
          {help}
        </div>
      );
    case 'RADIO':
      return (
        <div>{label}
          <div className="space-y-1">
            {field.optionsList().map((o) => (
              <label key={o} className="flex items-center gap-1.5 text-[11px]">
                <input type="radio" disabled className="accent-brand size-3" />{o}
              </label>
            ))}
          </div>
          {help}
        </div>
      );
    case 'CHECKBOX':
      return (
        <label className="flex items-center gap-2">
          <input type="checkbox" disabled className="accent-brand size-3.5" />
          <span className="text-xs">{field.label}{field.required && <span className="text-brand ml-0.5">*</span>}</span>
        </label>
      );
    case 'FILE':
      return (
        <div>{label}
          <div className="ftx-drop-zone p-3 text-center text-muted text-[10px]">
            Haga clic o arrastre archivos aqui
          </div>
          {help}
        </div>
      );
    case 'DATE':
      return <div>{label}<input type="date" className="ftx-input text-xs py-1.5" disabled />{help}</div>;
    case 'DATETIME':
      return <div>{label}<input type="datetime-local" className="ftx-input text-xs py-1.5" disabled />{help}</div>;
    case 'NUMBER':
      return <div>{label}<input type="number" className="ftx-input text-xs py-1.5" placeholder={field.placeholder ?? ''} disabled />{help}</div>;
    case 'EMAIL':
      return <div>{label}<input type="email" className="ftx-input text-xs py-1.5" placeholder={field.placeholder ?? ''} disabled />{help}</div>;
    case 'URL':
      return <div>{label}<input type="url" className="ftx-input text-xs py-1.5" placeholder={field.placeholder ?? ''} disabled />{help}</div>;
    case 'PHONE':
      return <div>{label}<input type="tel" className="ftx-input text-xs py-1.5" placeholder={field.placeholder ?? ''} disabled />{help}</div>;
    case 'SIGNATURE':
      return <div>{label}<div className="ftx-input h-12 grid place-items-center text-muted italic text-[10px]">Firma aqui</div>{help}</div>;
    default:
      return <div>{label}<input className="ftx-input text-xs py-1.5" placeholder={field.placeholder ?? ''} disabled />{help}</div>;
  }
}
