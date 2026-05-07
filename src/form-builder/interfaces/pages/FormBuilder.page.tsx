import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Send, MousePointerClick, Eye, SlidersHorizontal, Layers,
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

import {
  FormField, slugifyFieldKey, widthClassName,
  listPages, nextPageId, DEFAULT_PAGE_ID, type PageId, type FieldWidth,
} from '../../domain/models/FormField';
import { FIELD_TYPE_META, type FieldType } from '../../domain/models/FieldType';
import { FieldPalette, PALETTE_DRAG_PREFIX } from '../components/FieldPalette';
import { FieldEditor } from '../components/FieldEditor';
import { FormPreview } from '../components/FormPreview';
import { Inspector } from '../components/Inspector';
import { StepTabs } from '../components/StepTabs';
import { ContextChatbot } from '../components/ContextChatbot';
import { WorkflowRail } from '../components/WorkflowRail';
import { useFormsStore } from '../stores/forms.store';

const CANVAS_DROP_ID = 'canvas-drop-zone';
type RightTab = 'inspector' | 'preview';

function fieldSortableId(field: FormField, index: number): string {
  return field.id ? `field:${field.id}` : `field:tmp-${field.fieldKey}-${index}`;
}

function CanvasDroppable({
  fields, children, pageLabel,
}: {
  fields: FormField[];
  children: React.ReactNode;
  pageLabel: string;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: CANVAS_DROP_ID });

  if (fields.length === 0) {
    return (
      <div
        ref={setNodeRef}
        className={[
          'ftx-drop-zone min-h-[420px] grid place-items-center px-6 transition-colors',
          isOver ? 'ftx-drop-zone-active' : '',
        ].join(' ')}
      >
        <div className="text-center max-w-sm">
          <MousePointerClick size={32} className="mx-auto" style={{ color: 'var(--ftx-line-strong)' }} />
          <p className="font-display font-bold text-base text-ink mt-3">
            <span className="text-brand">{pageLabel}</span> sin campos
          </p>
          <p className="text-xs text-muted mt-1.5 leading-relaxed">
            Arrastra elementos desde la paleta izquierda. Cada elemento se ajusta
            al grid de 12 columnas; arrastra el borde derecho o inferior para
            cambiar ancho y alto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={[
        'relative grid grid-cols-12 gap-2 p-3 transition-colors auto-rows-min',
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

  const { current, loading, saving, error, loadForm, saveForm, publishForm, resetCurrent, linkWorkflow } =
    useFormsStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [pageLabels, setPageLabels] = useState<Record<PageId, string>>({});
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<FieldType | null>(null);
  const [activeReorderId, setActiveReorderId] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>('inspector');
  const [activePage, setActivePage] = useState<PageId>(DEFAULT_PAGE_ID);

  const canvasInnerRef = useRef<HTMLDivElement | null>(null);
  const [canvasWidthPx, setCanvasWidthPx] = useState(900);

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

  // Track canvas width for resize-snap calculations
  useEffect(() => {
    if (!canvasInnerRef.current) return;
    const el = canvasInnerRef.current;
    const update = () => setCanvasWidthPx(el.clientWidth || 900);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Always start on the first existing page after a reload
  useEffect(() => {
    const pages = listPages(fields);
    if (!pages.find((p) => p.id === activePage)) {
      setActivePage(pages[0]?.id ?? DEFAULT_PAGE_ID);
    }
  }, [fields, activePage]);

  const pages = useMemo(() => listPages(fields), [fields]);
  const visibleFields = useMemo(
    () => fields.filter((f) => f.page === activePage),
    [fields, activePage],
  );
  const pageCounts = useMemo(() => {
    const counts: Record<PageId, number> = {};
    for (const f of fields) counts[f.page] = (counts[f.page] ?? 0) + 1;
    for (const p of pages) if (!(p.id in counts)) counts[p.id] = 0;
    return counts;
  }, [fields, pages]);

  const activePageMeta = pages.find((p) => p.id === activePage) ?? pages[0];
  const activePageLabel = pageLabels[activePage] ?? activePageMeta?.label ?? 'Página 1';

  const existingKeys = useMemo(() => new Set(fields.map((f) => f.fieldKey)), [fields]);
  const sortableIds = useMemo(
    () => visibleFields.map((f, i) => fieldSortableId(f, i)),
    [visibleFields],
  );

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
    const meta = FIELD_TYPE_META[type];
    return new FormField({
      label: baseLabel,
      fieldKey: key,
      fieldType: type,
      required: false,
      position: fields.length,
      width: meta.defaultWidth as FieldWidth,
    }).with({ page: activePage });
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
      const overField = visibleFields.find((f, i) => fieldSortableId(f, i) === overId);
      const globalIndex = overField ? fields.indexOf(overField) + 1 : fields.length;
      const newFields = [...fields];
      newFields.splice(globalIndex, 0, next);
      setFields(newFields.map((f, i) => f.with({ position: i })));
      setSelectedKey(next.fieldKey);
      setRightTab('inspector');
      return;
    }

    if (activeId !== overId) {
      const oldIndex = sortableIds.indexOf(activeId);
      const newIndex = sortableIds.indexOf(overId);
      if (oldIndex >= 0 && newIndex >= 0) {
        const reorderedVisible = arrayMove(visibleFields, oldIndex, newIndex);
        const otherFields = fields.filter((f) => f.page !== activePage);
        const merged = [...reorderedVisible, ...otherFields];
        setFields(merged.map((f, i) => f.with({ position: i })));
      }
    }
  };

  const updateField = (target: FormField, next: FormField) => {
    setFields(fields.map((f) => (f === target ? next : f)));
  };

  const deleteField = (target: FormField) => {
    setFields(
      fields.filter((f) => f !== target).map((f, i) => f.with({ position: i })),
    );
    if (selectedKey === target.fieldKey) setSelectedKey(null);
  };

  const addPage = () => {
    const newId = nextPageId(pages.map((p) => p.id));
    setActivePage(newId);
    // Create an empty section as a placeholder so the page exists
    const placeholder = new FormField({
      label: `Sección ${pages.length + 1}`,
      fieldKey: slugifyFieldKey(`section ${pages.length + 1}`),
      fieldType: 'SECTION',
      required: false,
      position: fields.length,
      width: 12,
    }).with({ page: newId });
    setFields([...fields, placeholder]);
  };

  const removePage = (id: PageId) => {
    if (id === DEFAULT_PAGE_ID && pages.length === 1) return;
    setFields(fields.filter((f) => f.page !== id).map((f, i) => f.with({ position: i })));
    setActivePage(DEFAULT_PAGE_ID);
  };

  const renamePage = (id: PageId, label: string) => {
    setPageLabels((prev) => ({ ...prev, [id]: label }));
  };

  const addFieldFromAi = (field: FormField) => {
    const next = field
      .with({
        position: fields.length,
        width: field.width ?? (FIELD_TYPE_META[field.fieldType].defaultWidth as FieldWidth),
      })
      .with({ page: activePage });
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

  const selected = useMemo(
    () => fields.find((f) => f.fieldKey === selectedKey) ?? null,
    [fields, selectedKey],
  );

  return (
    <AppShell fitViewport>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="h-full flex flex-col min-h-0">
          {/* Top builder bar */}
          <div
            className="h-12 px-4 flex items-center gap-3 shrink-0"
            style={{
              background: 'var(--ftx-paper)',
              borderBottom: '1px solid var(--ftx-line)',
            }}
          >
            <button
              onClick={() => navigate('/forms')}
              className="ftx-btn ftx-btn-ghost text-xs py-1 px-2"
              aria-label="Volver"
            >
              <ArrowLeft size={14} /> Biblioteca
            </button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="font-mono text-[9px] tracking-widest text-muted uppercase">
                form //
              </span>
              {!isNew && current && (
                <>
                  <span className="ftx-tag-flat">v{current.version}</span>
                  <span
                    className={`ftx-tag-flat ${
                      current.status === 'PUBLISHED'
                        ? '!text-success !border-success'
                        : '!text-warning !border-warning'
                    }`}
                  >
                    {current.status.toLowerCase()}
                  </span>
                </>
              )}
              {isNew && <span className="ftx-tag ftx-tag-brand text-[9px]">NUEVO</span>}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nombre del formulario..."
                className="font-display font-bold text-base text-ink bg-transparent border-0 outline-none focus:bg-cream px-2 py-1 rounded flex-1 min-w-0"
              />
            </div>

            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="descripción corta..."
              className="hidden md:block ftx-input-flat !text-xs !py-1 max-w-[280px]"
            />

            <Button onClick={onSave} disabled={saving} icon={<Save size={14} />} className="text-xs py-1.5 px-3">
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
            {!isNew && current?.status !== 'PUBLISHED' && (
              <Button variant="primary" onClick={onPublish} icon={<Send size={14} />} className="text-xs py-1.5 px-3">
                Publicar
              </Button>
            )}
          </div>

          {/* Notices */}
          {(error || savedNotice) && (
            <div className="px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--ftx-line)' }}>
              {error && (
                <div className="text-xs rounded p-2 font-medium"
                     style={{ background: 'var(--ftx-brand-soft)', border: '1px solid var(--ftx-brand)', color: 'var(--ftx-brand-deep)' }}>
                  {error}
                </div>
              )}
              {savedNotice && !error && (
                <div className="text-xs rounded p-2 font-medium"
                     style={{ background: 'rgba(13,148,96,0.1)', border: '1px solid var(--ftx-success)', color: 'var(--ftx-success)' }}>
                  {savedNotice}
                </div>
              )}
            </div>
          )}

          {loading && !current && !isNew && (
            <div className="px-4 py-2 text-muted text-xs">Cargando formulario...</div>
          )}

          {/* Three-column workspace */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_360px] xl:grid-cols-[280px_minmax(0,1fr)_400px] gap-0 min-h-0 overflow-hidden">
            {/* LEFT: Palette */}
            <aside
              className="hidden lg:flex flex-col overflow-hidden"
              style={{ borderRight: '1px solid var(--ftx-line)', background: 'var(--ftx-bg)' }}
            >
              <div
                className="px-3 py-2.5 shrink-0 flex items-center gap-2"
                style={{ borderBottom: '1px solid var(--ftx-line)', background: 'var(--ftx-paper)' }}
              >
                <Layers size={13} className="text-brand" />
                <h3 className="font-display font-bold text-[12px] uppercase tracking-wider text-ink">
                  Elementos
                </h3>
                <span className="font-mono text-[9px] text-muted ml-auto">
                  {Object.keys(FIELD_TYPE_META).length} types
                </span>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <FieldPalette />
              </div>
            </aside>

            {/* CENTER: Canvas */}
            <section
              className="flex flex-col overflow-hidden"
              style={{ background: 'var(--ftx-canvas)' }}
            >
              <StepTabs
                pages={pages}
                active={activePage}
                counts={pageCounts}
                onChange={(p) => {
                  setActivePage(p);
                  setSelectedKey(null);
                }}
                onAdd={addPage}
                onRemove={removePage}
                onRename={renamePage}
                labelOverride={pageLabels}
              />

              <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                <div ref={canvasInnerRef} className="ftx-canvas-shell">
                  <div className="ftx-canvas-ruler">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <span key={i}>{String(i + 1).padStart(2, '0')}</span>
                    ))}
                  </div>
                  <div className="relative min-h-[420px]">
                    <div className="ftx-canvas-grid-bg" />
                    <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
                      <CanvasDroppable fields={visibleFields} pageLabel={activePageLabel}>
                        {visibleFields.map((field, idx) => (
                          <FieldEditor
                            key={fieldSortableId(field, idx)}
                            field={field}
                            index={idx}
                            canvasWidthPx={canvasWidthPx}
                            selected={selectedKey === field.fieldKey}
                            onSelect={() => {
                              setSelectedKey(field.fieldKey);
                              setRightTab('inspector');
                            }}
                            onChange={(next) => updateField(field, next)}
                            onDelete={() => deleteField(field)}
                          />
                        ))}
                      </CanvasDroppable>
                    </SortableContext>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-muted">
                  <span>
                    canvas · 12 cols · {visibleFields.length} en {activePageLabel}
                  </span>
                  <span>arrastra borde derecho ↔ ancho · borde inferior ↕ alto</span>
                </div>

                {/* Workflow rail — flujo de aprobación enlazado */}
                <WorkflowRail
                  formId={formId}
                  workflowId={current?.workflowId ?? null}
                  onLink={async (wfId) => {
                    if (!formId) return;
                    await linkWorkflow(formId, wfId);
                  }}
                />
              </div>
            </section>

            {/* RIGHT: Inspector / Preview */}
            <aside
              className="hidden lg:flex flex-col overflow-hidden"
              style={{ borderLeft: '1px solid var(--ftx-line)', background: 'var(--ftx-paper)' }}
            >
              <div
                className="flex shrink-0"
                style={{
                  background: 'var(--ftx-cream)',
                  borderBottom: '1px solid var(--ftx-line)',
                }}
              >
                <TabBtn
                  active={rightTab === 'inspector'}
                  onClick={() => setRightTab('inspector')}
                  icon={<SlidersHorizontal size={12} />}
                  label="Inspector"
                />
                <TabBtn
                  active={rightTab === 'preview'}
                  onClick={() => setRightTab('preview')}
                  icon={<Eye size={12} />}
                  label="Preview"
                />
              </div>
              <div className="flex-1 overflow-hidden">
                {rightTab === 'inspector' && (
                  <Inspector
                    field={selected}
                    pages={pages}
                    pageLabels={pageLabels}
                    onChange={(next) => {
                      if (!selected) return;
                      updateField(selected, next);
                      setSelectedKey(next.fieldKey);
                    }}
                    onDelete={() => selected && deleteField(selected)}
                  />
                )}
                {rightTab === 'preview' && (
                  <div className="h-full overflow-y-auto p-3">
                    <FormPreview
                      title={title}
                      description={description}
                      fields={fields}
                      page={activePage}
                    />
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDragType && (
            <div className="ftx-chip min-w-[180px] shadow-2xl border-brand border-l-brand bg-paper">
              <span className="ftx-chip-glyph">{FIELD_TYPE_META[activeDragType].glyph}</span>
              <div>
                <div className="text-[11px] font-medium text-ink leading-tight">
                  {FIELD_TYPE_META[activeDragType].label}
                </div>
                <div className="text-[9px] text-muted leading-tight font-mono">
                  + nuevo elemento
                </div>
              </div>
            </div>
          )}
          {activeReorderId && (() => {
            const idx = sortableIds.indexOf(activeReorderId);
            const f = idx >= 0 ? visibleFields[idx] : null;
            if (!f) return null;
            return (
              <div className={`${widthClassName(f.width)} ftx-tile ftx-tile-active bg-paper shadow-2xl`}>
                <div className="ftx-tile-toolbar">
                  <span className="ftx-chip-glyph !w-5 !h-5 !text-[10px]">
                    {FIELD_TYPE_META[f.fieldType].glyph}
                  </span>
                  <span className="text-[11px] font-medium text-ink truncate">{f.label}</span>
                </div>
              </div>
            );
          })()}
        </DragOverlay>
      </DndContext>

      {/* Floating context chatbot — outside the DndContext */}
      <ContextChatbot
        formTitle={title}
        context={context}
        onContextChange={setContext}
        existingKeys={existingKeys}
        activePage={activePage}
        onPick={addFieldFromAi}
      />
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
        'flex-1 px-3 py-2 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors',
        active ? 'text-ink' : 'text-muted hover:text-ink',
      ].join(' ')}
      style={{
        background: active ? 'var(--ftx-paper)' : 'transparent',
        borderBottom: active ? '2px solid var(--ftx-brand)' : '2px solid transparent',
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

const labelForType = (type: FieldType): string => {
  const labels: Record<FieldType, string> = {
    HEADING: 'Encabezado de seccion',
    PARAGRAPH: 'Parrafo de instrucciones',
    SECTION: 'Nueva seccion',
    DIVIDER: 'Divisor',
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
