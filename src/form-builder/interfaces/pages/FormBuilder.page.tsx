import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Send, MousePointerClick, Eye, Sparkles, Layers,
} from 'lucide-react';
import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor,
  useSensor, useSensors, useDroppable,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, arrayMove,
} from '@dnd-kit/sortable';

import { AppShell } from '@/shared/ui/components/AppShell';
import { Button } from '@/shared/ui/components/Button';

import { FormField, slugifyFieldKey, widthClassName, type FieldWidth } from '../../domain/models/FormField';
import { FIELD_TYPE_META, type FieldType } from '../../domain/models/FieldType';
import { FieldPalette, PALETTE_DRAG_PREFIX } from '../components/FieldPalette';
import { FieldEditor } from '../components/FieldEditor';
import { FormPreview } from '../components/FormPreview';
import { AiSuggestionPanel } from '../components/AiSuggestionPanel';
import { useFormsStore } from '../stores/forms.store';

const CANVAS_DROP_ID = 'canvas-drop-zone';
type RightTab = 'preview' | 'ai';

function fieldSortableId(field: FormField, index: number): string {
  return field.id ? `field:${field.id}` : `field:tmp-${field.fieldKey}-${index}`;
}

function CanvasDroppable({ fields, children }: { fields: FormField[]; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: CANVAS_DROP_ID });

  if (fields.length === 0) {
    return (
      <div
        ref={setNodeRef}
        className={[
          'ftx-drop-zone h-full grid place-items-center px-6 transition-colors',
          isOver ? 'ftx-drop-zone-active' : '',
        ].join(' ')}
      >
        <div className="text-center max-w-md">
          <MousePointerClick size={28} className="mx-auto text-line-strong" />
          <p className="text-sm font-medium text-ink mt-3">Suelta aqui tu primer campo</p>
          <p className="text-xs text-muted mt-1">
            Arrastra cualquier elemento de la paleta o pidele a la IA que sugiera campos a partir del contexto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={[
        'grid grid-cols-12 gap-2 p-2 rounded-md transition-colors min-h-full',
        isOver ? 'bg-brand-tint/40' : '',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

export default function FormBuilderPage() {
  const params = useParams();
  const navigate = useNavigate();
  const formId = params.id ? Number(params.id) : null;
  const isNew = !formId;

  const { current, loading, saving, error, loadForm, saveForm, publishForm, resetCurrent } = useFormsStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<FieldType | null>(null);
  const [activeReorderId, setActiveReorderId] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>('preview');
  const [metaOpen, setMetaOpen] = useState(true);

  useEffect(() => {
    if (isNew) {
      resetCurrent();
      setTitle('');
      setDescription('');
      setContext('');
      setFields([]);
    } else {
      loadForm(formId!);
    }
  }, [formId, isNew, loadForm, resetCurrent]);

  useEffect(() => {
    if (current && !isNew) {
      setTitle(current.title);
      setDescription(current.description ?? '');
      setContext(current.context ?? '');
      setFields([...current.fields]);
    }
  }, [current, isNew]);

  const existingKeys = useMemo(() => new Set(fields.map((f) => f.fieldKey)), [fields]);
  const sortableIds = useMemo(() => fields.map((f, i) => fieldSortableId(f, i)), [fields]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const buildField = (type: FieldType): FormField => {
    const baseLabel = labelForType(type);
    let key = slugifyFieldKey(baseLabel);
    let n = 1;
    while (existingKeys.has(key)) {
      key = `${slugifyFieldKey(baseLabel)}_${n++}`;
    }
    return new FormField({
      label: baseLabel,
      fieldKey: key,
      fieldType: type,
      required: false,
      position: fields.length,
      width: defaultWidthFor(type),
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    if (id.startsWith(PALETTE_DRAG_PREFIX)) {
      setActiveDragType(id.replace(PALETTE_DRAG_PREFIX, '') as FieldType);
    } else {
      setActiveReorderId(id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragType(null);
    setActiveReorderId(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith(PALETTE_DRAG_PREFIX)) {
      const type = activeId.replace(PALETTE_DRAG_PREFIX, '') as FieldType;
      const next = buildField(type);
      const overIndex = sortableIds.indexOf(overId);
      const insertIndex = overIndex >= 0 ? overIndex + 1 : fields.length;
      const newFields = [...fields];
      newFields.splice(insertIndex, 0, next);
      setFields(newFields.map((f, i) => f.with({ position: i })));
      setSelectedKey(next.fieldKey);
      return;
    }

    if (activeId !== overId) {
      const oldIndex = sortableIds.indexOf(activeId);
      const newIndex = sortableIds.indexOf(overId);
      if (oldIndex >= 0 && newIndex >= 0) {
        const reordered = arrayMove(fields, oldIndex, newIndex);
        setFields(reordered.map((f, i) => f.with({ position: i })));
      }
    }
  };

  const updateField = (index: number, next: FormField) => {
    const copy = [...fields];
    copy[index] = next;
    setFields(copy);
  };

  const deleteField = (index: number) => {
    const removed = fields[index];
    setFields(fields.filter((_, i) => i !== index).map((f, i) => f.with({ position: i })));
    if (removed && selectedKey === removed.fieldKey) setSelectedKey(null);
  };

  const addFieldFromAi = (field: FormField) => {
    const next = field.with({ position: fields.length, width: field.width ?? defaultWidthFor(field.fieldType) });
    setFields([...fields, next]);
    setSelectedKey(next.fieldKey);
  };

  const onSave = async () => {
    setSavedNotice(null);
    try {
      const saved = await saveForm({
        id: isNew ? undefined : formId!,
        draft: { title, description, context, fields },
      });
      setSavedNotice('Cambios guardados');
      if (isNew) navigate(`/forms/${saved.id}`, { replace: true });
    } catch {
      // store error
    }
  };

  const onPublish = async () => {
    if (!formId) return;
    if (!confirm('Publicar este formulario? Esta version sera la activa.')) return;
    await publishForm(formId);
    setSavedNotice('Formulario publicado');
  };

  return (
    <AppShell fitViewport>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="h-full flex flex-col min-h-0">
          {/* Top builder bar */}
          <div className="h-12 px-4 flex items-center gap-3 border-b-2 border-ink bg-paper shrink-0">
            <button
              onClick={() => navigate('/forms')}
              className="ftx-btn ftx-btn-ghost text-xs py-1 px-2"
              aria-label="Volver"
            >
              <ArrowLeft size={14} /> Biblioteca
            </button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="ftx-tag ftx-tag-brand text-[9px]">{isNew ? 'NUEVO' : 'EDITAR'}</span>
              {current && !isNew && (
                <>
                  <span className={`ftx-tag text-[9px] ${current.status === 'PUBLISHED' ? 'ftx-tag-success' : 'ftx-tag-warn'}`}>
                    {current.status.toLowerCase()}
                  </span>
                  <span className="ftx-tag ftx-tag-muted text-[9px]">v{current.version}</span>
                </>
              )}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nombre del formulario..."
                className="font-display font-bold text-base text-ink bg-transparent border-0 outline-none focus:bg-cream px-2 py-1 rounded flex-1 min-w-0"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button onClick={onSave} disabled={saving} icon={<Save size={14} />} className="text-xs py-1.5 px-3">
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
              {!isNew && current?.status !== 'PUBLISHED' && (
                <Button variant="primary" onClick={onPublish} icon={<Send size={14} />} className="text-xs py-1.5 px-3">
                  Publicar
                </Button>
              )}
            </div>
          </div>

          {/* Notices */}
          {(error || savedNotice) && (
            <div className="px-4 py-2 border-b border-line shrink-0">
              {error && (
                <div className="bg-brand-soft border-2 border-brand text-brand-deep text-xs rounded p-2 font-medium">
                  {error}
                </div>
              )}
              {savedNotice && !error && (
                <div className="bg-success/10 border-2 border-success text-success text-xs rounded p-2 font-medium">
                  {savedNotice}
                </div>
              )}
            </div>
          )}

          {loading && !current && !isNew && (
            <div className="px-4 py-2 text-muted text-xs">Cargando...</div>
          )}

          {/* Three-column workspace */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_340px] xl:grid-cols-[260px_minmax(0,1fr)_380px] gap-0 min-h-0 overflow-hidden">
            {/* LEFT: Compact palette */}
            <aside className="hidden lg:flex flex-col border-r-2 border-ink bg-cream overflow-hidden">
              <div className="px-3 py-2 border-b-2 border-ink bg-paper shrink-0">
                <div className="flex items-center gap-1.5">
                  <Layers size={13} className="text-brand" />
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-ink">Elementos</h3>
                </div>
                <p className="text-[10px] text-muted mt-0.5">Arrastra al canvas</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <FieldPalette />
              </div>
            </aside>

            {/* CENTER: Canvas */}
            <section className="flex flex-col bg-bg overflow-hidden">
              {/* Compact metadata strip */}
              <div className="border-b-2 border-ink bg-paper shrink-0">
                <button
                  onClick={() => setMetaOpen(!metaOpen)}
                  className="w-full px-4 py-2 flex items-center justify-between hover:bg-cream"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Metadatos del formulario</span>
                  <span className="text-[10px] text-brand font-medium">{metaOpen ? 'Ocultar' : 'Mostrar'}</span>
                </button>
                {metaOpen && (
                  <div className="px-4 pb-3 grid grid-cols-12 gap-2.5">
                    <label className="block col-span-12 sm:col-span-8">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Descripcion corta</span>
                      <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Una linea explicando para que sirve"
                        className="ftx-input mt-0.5 text-xs py-1.5"
                      />
                    </label>
                    <label className="block col-span-6 sm:col-span-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Codigo</span>
                      <input
                        value={isNew ? 'auto' : `FTX-${formId?.toString().padStart(4, '0')}`}
                        disabled
                        className="ftx-input mt-0.5 text-xs py-1.5 font-mono"
                      />
                    </label>
                    <label className="block col-span-6 sm:col-span-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Acceso</span>
                      <select className="ftx-input mt-0.5 text-xs py-1.5" defaultValue="restricted">
                        <option value="restricted">Restringido</option>
                        <option value="public">Publico</option>
                      </select>
                    </label>
                    <label className="block col-span-12">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Contexto detallado (alimenta a la IA)</span>
                      <textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Describe el proceso, los actores y los datos que el formulario debe capturar."
                        rows={2}
                        className="ftx-input mt-0.5 text-xs py-1.5 resize-y"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="px-4 py-2 flex items-center justify-between border-b border-line shrink-0">
                <div>
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-ink">Canvas</h3>
                  <p className="text-[10px] text-muted">Grid de 12 columnas. Cada campo controla su ancho.</p>
                </div>
                <span className="ftx-tag ftx-tag-muted text-[9px]">{fields.length} campos</span>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
                  <CanvasDroppable fields={fields}>
                    {fields.map((field, idx) => (
                      <FieldEditor
                        key={fieldSortableId(field, idx)}
                        field={field}
                        index={idx}
                        selected={selectedKey === field.fieldKey}
                        onSelect={() => setSelectedKey(field.fieldKey)}
                        onChange={(next) => updateField(idx, next)}
                        onDelete={() => deleteField(idx)}
                      />
                    ))}
                  </CanvasDroppable>
                </SortableContext>
              </div>
            </section>

            {/* RIGHT: Preview / AI tabs */}
            <aside className="hidden lg:flex flex-col border-l-2 border-ink bg-paper overflow-hidden">
              <div className="flex border-b-2 border-ink bg-cream shrink-0">
                <TabBtn active={rightTab === 'preview'} onClick={() => setRightTab('preview')} icon={<Eye size={13} />} label="Preview" />
                <TabBtn active={rightTab === 'ai'} onClick={() => setRightTab('ai')} icon={<Sparkles size={13} />} label="Asistente IA" />
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {rightTab === 'preview' ? (
                  <FormPreview title={title} description={description} fields={fields} />
                ) : (
                  <AiSuggestionPanel
                    formTitle={title}
                    formContext={context}
                    existingKeys={existingKeys}
                    onPick={addFieldFromAi}
                  />
                )}
              </div>
            </aside>
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDragType && (
            <div className="ftx-chip min-w-[80px] shadow-2xl ring-2 ring-brand">
              <div className="font-display font-bold text-base text-brand">{FIELD_TYPE_META[activeDragType].glyph}</div>
              <div className="text-[10px] font-medium text-ink">{FIELD_TYPE_META[activeDragType].label.split(' ')[0]}</div>
            </div>
          )}
          {activeReorderId && (() => {
            const idx = sortableIds.indexOf(activeReorderId);
            const f = idx >= 0 ? fields[idx] : null;
            if (!f) return null;
            return (
              <div className={`${widthClassName(f.width)} ftx-canvas-field shadow-2xl ring-2 ring-brand bg-paper`}>
                <div className="px-2 py-1.5 border-b-2 border-line bg-cream flex items-center gap-1.5">
                  <span className="size-6 rounded bg-brand/10 grid place-items-center text-brand text-xs font-bold">
                    {FIELD_TYPE_META[f.fieldType].glyph}
                  </span>
                  <span className="text-xs font-medium text-ink truncate">{f.label}</span>
                </div>
              </div>
            );
          })()}
        </DragOverlay>
      </DndContext>
    </AppShell>
  );
}

function TabBtn({
  active, onClick, icon, label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex-1 px-3 py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border-r-2 border-ink last:border-r-0',
        active ? 'bg-paper text-ink border-b-0' : 'text-muted hover:text-ink hover:bg-paper',
      ].join(' ')}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

const labelForType = (type: FieldType): string => {
  const labels: Record<FieldType, string> = {
    TEXT: 'Texto',
    TEXTAREA: 'Descripcion',
    NUMBER: 'Numero',
    EMAIL: 'Correo electronico',
    DATE: 'Fecha',
    DATETIME: 'Fecha y hora',
    SELECT: 'Seleccion',
    MULTI_SELECT: 'Multi-seleccion',
    RADIO: 'Opcion unica',
    CHECKBOX: 'Confirmacion',
    FILE: 'Adjunto',
    URL: 'URL',
    PHONE: 'Telefono',
    SIGNATURE: 'Firma',
  };
  return labels[type];
};

const defaultWidthFor = (type: FieldType): FieldWidth => {
  const wide: FieldType[] = ['TEXTAREA', 'FILE', 'SIGNATURE'];
  const half: FieldType[] = ['TEXT', 'EMAIL', 'PHONE', 'URL', 'NUMBER', 'DATE', 'DATETIME', 'SELECT'];
  if (wide.includes(type)) return 12;
  if (half.includes(type)) return 6;
  return 12;
};
