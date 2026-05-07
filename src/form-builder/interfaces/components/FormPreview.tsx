import { FormField } from '../../domain/models/FormField';

interface Props {
  title: string;
  description: string;
  fields: FormField[];
}

export function FormPreview({ title, description, fields }: Props) {
  return (
    <div className="ftx-card p-6 bg-paper">
      <span className="ftx-tag ftx-tag-mint">preview</span>
      <h2 className="font-display font-bold text-2xl mt-2">{title || 'Sin titulo'}</h2>
      {description && <p className="text-ink/70 mt-1 text-sm">{description}</p>}

      <div className="mt-5 space-y-4">
        {fields.length === 0 && (
          <div className="border-2 border-dashed border-ink/30 p-8 text-center text-ink/50 text-sm">
            Agrega campos desde la paleta o pidele sugerencias a la IA.
          </div>
        )}

        {fields.map((field) => (
          <PreviewField key={`${field.fieldKey}-${field.position}`} field={field} />
        ))}

        {fields.length > 0 && (
          <button
            type="button"
            disabled
            className="ftx-btn ftx-btn-primary w-full mt-2 cursor-default"
          >
            Enviar solicitud
          </button>
        )}
      </div>
    </div>
  );
}

function PreviewField({ field }: { field: FormField }) {
  const baseLabel = (
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-xs font-mono uppercase tracking-wider text-ink/80">
        {field.label}
        {field.required && <span className="text-flame ml-1">*</span>}
      </span>
    </div>
  );

  const help = field.helpText && (
    <p className="mt-1 text-xs text-ink/50">{field.helpText}</p>
  );

  switch (field.fieldType) {
    case 'TEXTAREA':
      return (
        <div>
          {baseLabel}
          <textarea className="ftx-input" rows={3} placeholder={field.placeholder ?? ''} disabled />
          {help}
        </div>
      );
    case 'SELECT':
      return (
        <div>
          {baseLabel}
          <select className="ftx-input" disabled>
            <option>—</option>
            {field.optionsList().map((o) => <option key={o}>{o}</option>)}
          </select>
          {help}
        </div>
      );
    case 'MULTI_SELECT':
      return (
        <div>
          {baseLabel}
          <div className="flex flex-wrap gap-2">
            {field.optionsList().map((o) => (
              <span key={o} className="ftx-tag ftx-tag-citron">{o}</span>
            ))}
            {field.optionsList().length === 0 && <span className="text-xs text-ink/50">Sin opciones</span>}
          </div>
          {help}
        </div>
      );
    case 'RADIO':
      return (
        <div>
          {baseLabel}
          <div className="space-y-1.5">
            {field.optionsList().map((o) => (
              <label key={o} className="flex items-center gap-2 text-sm">
                <input type="radio" disabled className="size-4" />
                {o}
              </label>
            ))}
          </div>
          {help}
        </div>
      );
    case 'CHECKBOX':
      return (
        <label className="flex items-center gap-2">
          <input type="checkbox" disabled className="size-4 border-2 border-ink" />
          <span className="text-sm">{field.label}{field.required && <span className="text-flame ml-1">*</span>}</span>
        </label>
      );
    case 'FILE':
      return (
        <div>
          {baseLabel}
          <div className="ftx-input border-dashed text-center text-ink/50 cursor-not-allowed">
            Soltar archivo aqui
          </div>
          {help}
        </div>
      );
    case 'DATE':
      return <div>{baseLabel}<input type="date" className="ftx-input" disabled />{help}</div>;
    case 'DATETIME':
      return <div>{baseLabel}<input type="datetime-local" className="ftx-input" disabled />{help}</div>;
    case 'NUMBER':
      return <div>{baseLabel}<input type="number" className="ftx-input" placeholder={field.placeholder ?? ''} disabled />{help}</div>;
    case 'EMAIL':
      return <div>{baseLabel}<input type="email" className="ftx-input" placeholder={field.placeholder ?? ''} disabled />{help}</div>;
    case 'URL':
      return <div>{baseLabel}<input type="url" className="ftx-input" placeholder={field.placeholder ?? ''} disabled />{help}</div>;
    case 'PHONE':
      return <div>{baseLabel}<input type="tel" className="ftx-input" placeholder={field.placeholder ?? ''} disabled />{help}</div>;
    case 'SIGNATURE':
      return (
        <div>
          {baseLabel}
          <div className="ftx-input h-20 flex items-center justify-center text-ink/40 italic">Firma aqui</div>
          {help}
        </div>
      );
    default:
      return <div>{baseLabel}<input className="ftx-input" placeholder={field.placeholder ?? ''} disabled />{help}</div>;
  }
}
