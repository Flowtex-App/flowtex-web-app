import { Trash2, Lock, Unlock } from 'lucide-react';
import {
  FormField, slugifyFieldKey, type FieldWidth, type PageDef, type PageId,
} from '../../domain/models/FormField';
import { FIELD_TYPES, FIELD_TYPE_META, type FieldType } from '../../domain/models/FieldType';

interface Props {
  field: FormField | null;
  pages: PageDef[];
  pageLabels?: Record<PageId, string>;
  onChange: (next: FormField) => void;
  onDelete: () => void;
}

const WIDTHS: FieldWidth[] = [3, 4, 6, 8, 9, 12];
const ROW_OPTIONS = [1, 2, 3, 4];

export function Inspector({ field, pages, pageLabels, onChange, onDelete }: Props) {
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
          <div className="ftx-inspector-section pb-2">
            <h4 className="ftx-inspector-title">Texto del bloque</h4>
            <div className="ftx-inspector-row">
              <label>Contenido</label>
              <input
                value={field.helpText ?? ''}
                onChange={(e) => update({ helpText: e.target.value })}
                className="ftx-input-flat"
                placeholder={
                  field.fieldType === 'PARAGRAPH'
                    ? 'Texto de instruccion al usuario'
                    : field.fieldType === 'SECTION'
                    ? 'Subtitulo / categoria'
                    : ''
                }
              />
            </div>
          </div>
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

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-line bg-cream flex items-center justify-between">
        <span className="font-mono text-[10px] text-muted">
          {field.id ? `#${field.id}` : 'sin guardar'}
        </span>
        <button
          onClick={onDelete}
          className="ftx-btn ftx-btn-danger text-xs py-1 px-2"
        >
          <Trash2 size={12} /> Eliminar
        </button>
      </div>
    </div>
  );
}
