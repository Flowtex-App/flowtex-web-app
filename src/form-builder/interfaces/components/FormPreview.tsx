import { FormField, listPages, widthClassName, type PageId } from '../../domain/models/FormField';
import { FieldRender } from './FieldRender';

interface Props {
  title: string;
  description: string;
  fields: FormField[];
  /** Optional: only show fields of this page. If omitted, shows all. */
  page?: PageId;
}

export function FormPreview({ title, description, fields, page }: Props) {
  const allPages = listPages(fields);
  const activePage = page ?? allPages[0]?.id ?? 'p1';
  const visible = fields.filter((f) => f.page === activePage);
  const pageMeta = allPages.find((p) => p.id === activePage) ?? allPages[0];

  return (
    <div className="ftx-card overflow-hidden">
      <div className="ftx-form-header px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[9px] font-mono uppercase tracking-widest text-white/70">
            previsualización · {pageMeta ? String(pageMeta.index + 1).padStart(2, '0') : '01'} {pageMeta?.label}
          </div>
          <h2 className="font-editorial italic text-xl leading-tight truncate">
            {title || 'Nuevo formulario'}
          </h2>
        </div>
        <span className="ftx-tag bg-white text-brand border-white text-[9px]">
          {visible.length} {visible.length === 1 ? 'campo' : 'campos'}
        </span>
      </div>

      <div className="p-4" style={{ background: 'var(--ftx-paper)' }}>
        {description && (
          <p className="text-xs text-ink-2 mb-3 leading-snug border-l-2 pl-2.5"
             style={{ borderColor: 'var(--ftx-line)' }}>
            {description}
          </p>
        )}

        {visible.length === 0 ? (
          <div className="ftx-drop-zone p-6 text-center text-muted text-xs">
            Sin campos en <span className="font-mono">{pageMeta?.label}</span>.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-2 auto-rows-min">
              {visible.map((field) => (
                <div key={`${field.fieldKey}-${field.position}`} className={widthClassName(field.width)}>
                  <FieldRender field={field} />
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button type="button" disabled className="ftx-btn flex-1 text-xs">
                ← Anterior
              </button>
              <button type="button" disabled className="ftx-btn ftx-btn-primary flex-1 text-xs">
                {pageMeta && pageMeta.index < allPages.length - 1 ? 'Siguiente →' : 'Enviar solicitud'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
