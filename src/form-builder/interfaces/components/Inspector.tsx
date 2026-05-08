import { Lock, Unlock, Image as ImageIcon } from 'lucide-react';
import {
  FormField, slugifyFieldKey, type FieldWidth, type PageDef, type PageId,
  parsePresentationalConfig, serializePresentationalConfig, type PresentationalConfig,
} from '../../domain/models/FormField';
import { FIELD_TYPES, FIELD_TYPE_META, type FieldType } from '../../domain/models/FieldType';

interface Props {
  field: FormField | null;
  pages: PageDef[];
  pageLabels?: Record<PageId, string>;
  onChange: (next: FormField) => void;
  /** Mantained for backward compat; the delete control lives on each tile now. */
  onDelete?: () => void;
}

const WIDTHS: FieldWidth[] = [3, 4, 6, 8, 9, 12];
const ROW_OPTIONS = [1, 2, 3, 4];

export function Inspector({ field, pages, pageLabels, onChange }: Props) {
  if (!field) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center">
        <div className="size-10 rounded border-2 border-dashed border-line-strong grid place-items-center text-muted text-lg font-mono mb-3">
          ∅
        </div>
        <p className="font-display font-bold text-sm text-ink">Sin seleccion</p>
        <p className="text-[11px] text-muted mt-1.5 leading-relaxed max-w-[200px]">
          Toca cualquier elemento del canvas para editarlo. Las propiedades aparecen aqui.
        </p>
        <div className="mt-4 px-3 py-2 bg-cream border border-line rounded text-[10px] text-muted font-mono leading-relaxed">
          drag · click · resize
        </div>
      </div>
    );
  }

  const meta = FIELD_TYPE_META[field.fieldType];
  const update = (patch: Parameters<FormField['with']>[0]) => onChange(field.with(patch));

  const labelLooksAuto =
    !field.label || field.fieldKey === slugifyFieldKey(field.label);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-line bg-cream">
        <div className="flex items-center gap-2 mb-2">
          <span className="ftx-chip-glyph !w-7 !h-7 !text-sm">{meta.glyph}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
              {meta.group} · {field.fieldType}
            </div>
            <div className="text-sm font-display font-bold text-ink truncate">
              {field.label || 'Sin etiqueta'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted">
          <span className="ftx-tag-flat">w {field.width}/12</span>
          <span className="ftx-tag-flat">h {field.rows}</span>
          {field.required && <span className="ftx-tag-flat" style={{ color: '#DA291C', borderColor: '#DA291C' }}>req</span>}
          {meta.presentational && <span className="ftx-tag-flat">presentacional</span>}
        </div>
      </div>

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* General */}
        <div className="ftx-inspector-section pb-2">
          <h4 className="ftx-inspector-title">General</h4>

          <div className="ftx-inspector-row">
            <label>Etiqueta</label>
            <input
              value={field.label}
              onChange={(e) => {
                const label = e.target.value;
                update({
                  label,
                  fieldKey: labelLooksAuto ? slugifyFieldKey(label) : field.fieldKey,
                });
              }}
              className="ftx-input-flat"
            />
          </div>

          <div className="ftx-inspector-row">
            <label>Clave</label>
            <input
              value={field.fieldKey}
              onChange={(e) => update({ fieldKey: slugifyFieldKey(e.target.value) })}
              className="ftx-input-flat font-mono"
            />
          </div>

          <div className="ftx-inspector-row">
            <label>Tipo</label>
            <select
              value={field.fieldType}
              onChange={(e) => update({ fieldType: e.target.value as FieldType })}
              className="ftx-input-flat"
            >
              {FIELD_TYPES.map((t) => (
                <option key={t} value={t}>{FIELD_TYPE_META[t].label} · {t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Layout */}
        <div className="ftx-inspector-section pb-2">
          <h4 className="ftx-inspector-title">Disposicion en el grid</h4>

          <div className="ftx-inspector-row">
            <label>Ancho</label>
            <div className="ftx-width-pill">
              {WIDTHS.map((w) => (
                <button
                  key={w}
                  onClick={() => update({ width: w })}
                  className={field.width === w ? 'is-active' : ''}
                  title={`${w} de 12`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="ftx-inspector-row">
            <label>Filas</label>
            <div className="ftx-width-pill">
              {ROW_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => update({ rows: r })}
                  className={field.rows === r ? 'is-active' : ''}
                  title={`${r} fila${r > 1 ? 's' : ''} visuales`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="ftx-inspector-row">
            <label>Posición</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => update({ colStart: null, rowStart: null })}
                className={[
                  'flex-1 px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded border',
                  field.colStart == null && field.rowStart == null
                    ? 'border-brand bg-brand-tint text-brand'
                    : 'border-line bg-paper text-muted hover:border-steel',
                ].join(' ')}
                title="El campo fluye natural en el grid"
              >
                auto
              </button>
              <button
                onClick={() => update({ colStart: field.colStart ?? 1, rowStart: field.rowStart ?? 1 })}
                className={[
                  'flex-1 px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded border',
                  field.colStart != null || field.rowStart != null
                    ? 'border-brand bg-brand-tint text-brand'
                    : 'border-line bg-paper text-muted hover:border-steel',
                ].join(' ')}
                title="Posición manual en el grid"
              >
                manual
              </button>
            </div>
          </div>

          {(field.colStart != null || field.rowStart != null) && (
            <>
              <div className="ftx-inspector-row">
                <label>Col inicio</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={field.colStart ?? 1}
                  onChange={(e) => update({ colStart: Math.max(1, Math.min(12, Number(e.target.value))) })}
                  className="ftx-input-flat font-mono"
                />
              </div>
              <div className="ftx-inspector-row">
                <label>Fila inicio</label>
                <input
                  type="number"
                  min={1}
                  value={field.rowStart ?? 1}
                  onChange={(e) => update({ rowStart: Math.max(1, Number(e.target.value)) })}
                  className="ftx-input-flat font-mono"
                />
              </div>
            </>
          )}
        </div>

        {/* Page assignment */}
        <div className="ftx-inspector-section pb-2">
          <h4 className="ftx-inspector-title">Página del formulario</h4>
          <div className="px-3 pb-2 grid grid-cols-2 gap-1.5">
            {pages.map((p) => {
              const isActive = field.page === p.id;
              const label = pageLabels?.[p.id] ?? p.label;
              return (
                <button
                  key={p.id}
                  onClick={() => update({ page: p.id as PageId })}
                  className={[
                    'flex flex-col items-start px-2 py-2 border rounded text-left transition-colors',
                    isActive
                      ? 'border-brand bg-brand-tint'
                      : 'border-line bg-paper hover:border-steel hover:bg-cream',
                  ].join(' ')}
                >
                  <span className="font-mono text-[9px] tracking-widest text-muted">
                    {String(p.index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] font-medium text-ink leading-tight mt-0.5 truncate w-full">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="px-3 pb-2 text-[10px] text-muted leading-snug">
            Mueve el campo a otra página del formulario. Las páginas funcionan
            como pestañas tipo wizard.
          </p>
        </div>

        {/* Content */}
        {!meta.presentational && (
          <div className="ftx-inspector-section pb-2">
            <h4 className="ftx-inspector-title">Contenido</h4>
            <div className="ftx-inspector-row">
              <label>Placeholder</label>
              <input
                value={field.placeholder ?? ''}
                onChange={(e) => update({ placeholder: e.target.value })}
                className="ftx-input-flat"
                placeholder="Opcional"
              />
            </div>
            <div className="ftx-inspector-row">
              <label>Texto ayuda</label>
              <input
                value={field.helpText ?? ''}
                onChange={(e) => update({ helpText: e.target.value })}
                className="ftx-input-flat"
                placeholder="Mostrado debajo del campo"
              />
            </div>
            {meta.supportsOptions && (
              <div className="ftx-inspector-row">
                <label>Opciones</label>
                <input
                  value={field.options ?? ''}
                  onChange={(e) => update({ options: e.target.value })}
                  className="ftx-input-flat font-mono"
                  placeholder='["A","B","C"]'
                />
              </div>
            )}
          </div>
        )}

        {meta.presentational && (
          <PresentationalEditors field={field} update={update} />
        )}

        {/* Validation */}
        {!meta.presentational && (
          <div className="ftx-inspector-section pb-3">
            <h4 className="ftx-inspector-title">Validacion</h4>
            <div className="px-3 pb-1">
              <button
                onClick={() => update({ required: !field.required })}
                className={[
                  'w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded border transition-colors',
                  field.required
                    ? 'border-brand bg-brand-tint'
                    : 'border-line bg-paper hover:border-steel hover:bg-cream',
                ].join(' ')}
              >
                <span className="flex items-center gap-2">
                  {field.required ? <Lock size={12} className="text-brand" /> : <Unlock size={12} className="text-muted" />}
                  <span className="text-[12px] font-medium text-ink">
                    {field.required ? 'Campo obligatorio' : 'Campo opcional'}
                  </span>
                </span>
                <span className="font-mono text-[10px] text-muted">
                  {field.required ? 'required' : 'optional'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer — sólo el id del field para referencia. El botón eliminar
          ya está disponible en el toolbar de cada tile en el canvas. */}
      <div className="px-3 py-2.5 border-t border-line bg-cream flex items-center justify-between">
        <span className="font-mono text-[10px] text-muted">
          {field.id ? `#${field.id}` : 'sin guardar'}
        </span>
        <span className="font-mono text-[10px] text-muted/60">
          {field.fieldType.toLowerCase()}
        </span>
      </div>
    </div>
  );
}

/**
 * Editor de los bloques presentational. Cada tipo (HEADING, PARAGRAPH, SECTION,
 * DIVIDER, SPACER, IMAGE) tiene controles de:
 *   - Texto/contenido (cuando aplica)
 *   - Color de fondo
 *   - Color de texto (cuando aplica)
 *   - URL de imagen + alt (solo IMAGE)
 *
 * Los colores e imagen src se persisten en `field.options` como JSON
 * (ver parsePresentationalConfig en FormField.ts).
 */
function PresentationalEditors({
  field,
  update,
}: {
  field: FormField;
  update: (patch: Parameters<FormField['with']>[0]) => void;
}) {
  const cfg = parsePresentationalConfig(field.options);

  const updateConfig = (patch: Partial<PresentationalConfig>) => {
    const next = { ...cfg, ...patch };
    // Limpieza: si vacío string, lo borramos
    if (patch.bg === '')  next.bg = undefined;
    if (patch.fg === '')  next.fg = undefined;
    if (patch.src === '') next.src = undefined;
    if (patch.alt === '') next.alt = undefined;
    update({ options: serializePresentationalConfig(next) });
  };

  const isImage = field.fieldType === 'IMAGE';
  const isSpacerOrDivider = field.fieldType === 'SPACER' || field.fieldType === 'DIVIDER';

  return (
    <>
      {/* Contenido textual: oculto para SPACER/DIVIDER/IMAGE (no aplica) */}
      {!isSpacerOrDivider && !isImage && (
        <div className="ftx-inspector-section pb-2">
          <h4 className="ftx-inspector-title">Texto del bloque</h4>
          <div className="ftx-inspector-row">
            <label>Contenido</label>
            {field.fieldType === 'PARAGRAPH' ? (
              <textarea
                value={field.helpText ?? ''}
                onChange={(e) => update({ helpText: e.target.value })}
                className="ftx-input-flat resize-y leading-relaxed"
                rows={4}
                placeholder="Escribe varios párrafos. Pulsa Enter para saltos de línea."
              />
            ) : (
              <input
                value={field.helpText ?? ''}
                onChange={(e) => update({ helpText: e.target.value })}
                className="ftx-input-flat"
                placeholder={
                  field.fieldType === 'SECTION'
                    ? 'Subtítulo / categoría'
                    : 'Texto auxiliar bajo el encabezado'
                }
              />
            )}
          </div>
        </div>
      )}

      {/* IMAGE: URL y alt */}
      {isImage && (
        <div className="ftx-inspector-section pb-2">
          <h4 className="ftx-inspector-title flex items-center gap-1.5">
            <ImageIcon size={12} className="text-brand" /> Imagen
          </h4>
          <div className="ftx-inspector-row">
            <label>URL</label>
            <input
              value={cfg.src ?? ''}
              onChange={(e) => updateConfig({ src: e.target.value })}
              className="ftx-input-flat"
              placeholder="https://ejemplo.com/imagen.png"
              type="url"
            />
          </div>
          <div className="ftx-inspector-row">
            <label>Texto alt</label>
            <input
              value={cfg.alt ?? ''}
              onChange={(e) => updateConfig({ alt: e.target.value })}
              className="ftx-input-flat"
              placeholder="Descripción para accesibilidad"
            />
          </div>
          <div className="ftx-inspector-row">
            <label>Pie de imagen</label>
            <input
              value={field.helpText ?? ''}
              onChange={(e) => update({ helpText: e.target.value })}
              className="ftx-input-flat"
              placeholder="Texto opcional debajo"
            />
          </div>
        </div>
      )}

      {/* Colores: para HEADING/PARAGRAPH/SECTION/SPACER/IMAGE (no DIVIDER) */}
      {field.fieldType !== 'DIVIDER' && (
        <div className="ftx-inspector-section pb-2">
          <h4 className="ftx-inspector-title">Apariencia</h4>
          <div className="ftx-inspector-row">
            <label>Fondo</label>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={cfg.bg ?? '#ffffff'}
                onChange={(e) => updateConfig({ bg: e.target.value })}
                className="size-8 rounded border border-line cursor-pointer p-0"
                title="Color de fondo"
              />
              <input
                value={cfg.bg ?? ''}
                onChange={(e) => updateConfig({ bg: e.target.value })}
                placeholder="sin color"
                className="ftx-input-flat font-mono text-[11px] flex-1"
              />
              {cfg.bg && (
                <button
                  onClick={() => updateConfig({ bg: '' })}
                  className="text-[10px] text-muted hover:text-brand px-1.5"
                  title="Quitar fondo"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {field.fieldType !== 'SPACER' && field.fieldType !== 'IMAGE' && (
            <div className="ftx-inspector-row">
              <label>Texto</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={cfg.fg ?? '#111827'}
                  onChange={(e) => updateConfig({ fg: e.target.value })}
                  className="size-8 rounded border border-line cursor-pointer p-0"
                  title="Color de texto"
                />
                <input
                  value={cfg.fg ?? ''}
                  onChange={(e) => updateConfig({ fg: e.target.value })}
                  placeholder="por defecto"
                  className="ftx-input-flat font-mono text-[11px] flex-1"
                />
                {cfg.fg && (
                  <button
                    onClick={() => updateConfig({ fg: '' })}
                    className="text-[10px] text-muted hover:text-brand px-1.5"
                    title="Quitar color de texto"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
