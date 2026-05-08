import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import {
  ArrowLeft, Save, Send, MousePointerClick, Eye, SlidersHorizontal, Layers,
  GitBranch, FileText, Rocket, HelpCircle,
} from 'lucide-react';
import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor,
  useSensor, useSensors, useDroppable,
  type DragEndEvent, type DragStartEvent, type DragOverEvent,
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
import { useFormsStore } from '../stores/forms.store';
import { WorkflowCanvas, type WorkflowCanvasHandle } from '@/workflow/interfaces/components/WorkflowCanvas';
import type { FormContext } from '@/workflow/domain/models/FormContext';
import { useWorkflowStore } from '@/workflow/interfaces/stores/workflow.store';
import { startFormBuilderTour, maybeAutoStartFormBuilderTour } from '@/shared/ui/tour/tours';

const CANVAS_DROP_ID = 'canvas-drop-zone';
type RightTab = 'inspector' | 'preview';
type MainTab = 'structure' | 'approval';

function fieldSortableId(field: FormField, index: number): string {
  return field.id ? `field:${field.id}` : `field:tmp-${field.fieldKey}-${index}`;
}

/** Grid row height in pixels — single source of truth for the canvas. */
const GRID_ROW_PX = 80;
/** Min rows to show even on empty pages. */
const MIN_ROWS = 10;
/** Extra empty rows below the last placed field (to permit dropping further down). */
const EXTRA_TRAIL_ROWS = 4;

/**
 * Una celda del grid que actúa como drop target invisible.
 *
 * No tiene estilo propio: dnd-kit la usa solo para detectar bajo qué (col, row)
 * está el cursor. El highlight visual se renderiza como un overlay del padre
 * que cubre el área (col..col+W-1, row..row+R-1) — así no se contamina la UI
 * con bordes en cada celda.
 */
function DropCell({ row, col }: { row: number; col: number }) {
  const id = `cell:r${row}c${col}`;
  const { setNodeRef } = useDroppable({ id, data: { row, col } });
  return (
    <div
      ref={setNodeRef}
      style={{ gridColumnStart: col, gridRowStart: row, zIndex: 0 }}
      data-cell={`${row}-${col}`}
    />
  );
}

/**
 * El canvas: grid 12 cols × N filas. Las celdas son drop targets invisibles
 * para dnd-kit; el highlight del área de drop se dibuja como un overlay
 * que cubre exactamente ancho×alto del field.
 */
function CanvasGrid({
  fields, children, dropHead, dragWidth, dragRows, pageLabel,
}: {
  fields: FormField[];
  children: React.ReactNode;
  /** Celda bajo el cursor; null cuando no hay drag o no está sobre celdas. */
  dropHead: { row: number; col: number } | null;
  dragWidth: number;
  dragRows: number;
  pageLabel: string;
}) {
  const { isOver: isOverGrid, setNodeRef } = useDroppable({ id: CANVAS_DROP_ID });

  const rowsCount = useMemo(() => {
    const placedRows = fields
      .filter((f) => f.rowStart != null)
      .map((f) => (f.rowStart ?? 1) + (f.rows ?? 1) - 1);
    const flowingRows = fields.filter((f) => f.rowStart == null).length;
    const used = Math.max(flowingRows, ...placedRows, 0);
    return Math.max(MIN_ROWS, used + EXTRA_TRAIL_ROWS);
  }, [fields]);

  // Recortamos el ancho/alto de la preview si excede los límites del grid
  // (col 10 con width=6 → preview de width=3).
  const previewWidth = dropHead
    ? Math.min(dragWidth, 12 - dropHead.col + 1)
    : dragWidth;
  const previewRows = dropHead
    ? Math.min(dragRows, rowsCount - dropHead.row + 1)
    : dragRows;

  return (
    <div
      ref={setNodeRef}
      className={[
        'relative grid grid-cols-12 gap-2 p-3 transition-colors',
        isOverGrid && !dropHead ? 'bg-brand-tint/20' : '',
      ].join(' ')}
      style={{
        gridTemplateRows: `repeat(${rowsCount}, minmax(${GRID_ROW_PX}px, auto))`,
      }}
    >
      {/* Drop targets invisibles, una por celda */}
      {Array.from({ length: rowsCount }).map((_, r) =>
        Array.from({ length: 12 }).map((_, c) => (
          <DropCell key={`r${r + 1}c${c + 1}`} row={r + 1} col={c + 1} />
        )),
      )}

      {/* Overlay de la zona de drop: cubre el ancho y alto reales del field
          que se está arrastrando. Solo aparece cuando el cursor está sobre
          una celda (dropHead != null). */}
      {dropHead && (
        <div
          className="ftx-drop-preview pointer-events-none"
          style={{
            gridColumnStart: dropHead.col,
            gridColumnEnd: `span ${previewWidth}`,
            gridRowStart: dropHead.row,
            gridRowEnd: `span ${previewRows}`,
            zIndex: 4,
          }}
        />
      )}

      {/* Empty-state hint */}
      {fields.length === 0 && !dropHead && (
        <div
          className="pointer-events-none text-center max-w-sm"
          style={{
            gridColumnStart: 1,
            gridColumnEnd: 13,
            gridRowStart: Math.floor(rowsCount / 2),
            gridRowEnd: 'span 2',
            placeSelf: 'center',
            zIndex: 2,
          }}
        >
          <MousePointerClick size={32} className="mx-auto" style={{ color: 'var(--ftx-line-strong)' }} />
          <p className="font-display font-bold text-base text-ink mt-3">
            <span className="text-brand">{pageLabel}</span> sin campos
          </p>
          <p className="text-xs text-muted mt-1.5 leading-relaxed">
            Arrastra desde la paleta hasta la celda donde quieras colocarlo.
            Puedes dejar filas vacías como espaciadores.
          </p>
        </div>
      )}

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
  const [mainTab, setMainTab] = useState<MainTab>('structure');
  const [publishingAll, setPublishingAll] = useState(false);
  const [dropHead, setDropHead] = useState<{ row: number; col: number } | null>(null);
  const [dirty, setDirty] = useState(false);

  const publishWorkflowOne = useWorkflowStore((s) => s.publishOne);
  const currentWorkflow = useWorkflowStore((s) => s.current);
  const workflowCanvasRef = useRef<WorkflowCanvasHandle | null>(null);

  // Snapshot del último estado guardado, para detectar cambios sin guardar.
  const savedSnapshot = useRef<string>('');

  // Bloquea navegación interna (sidebar, "Volver", etc.) si hay cambios sin
  // guardar. El componente renderiza un modal cuando blocker.state === 'blocked'.
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    dirty && currentLocation.pathname !== nextLocation.pathname,
  );

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

  // Snapshot helper — produce el mismo string para el mismo state. Lo usamos
  // tanto al cargar (para fijar la baseline) como al detectar cambios.
  const snapshot = (
    t: string, d: string, c: string, fs: FormField[],
  ): string => JSON.stringify({
    title: t,
    description: d,
    context: c,
    fields: fs.map((f) => ({
      id: f.id ?? null,
      label: f.label,
      fieldKey: f.fieldKey,
      fieldType: f.fieldType,
      required: f.required,
      placeholder: f.placeholder,
      helpText: f.rawHelpText,
      position: f.position,
      width: f.width,
      rows: f.rows,
      colStart: f.colStart,
      rowStart: f.rowStart,
      options: f.options,
      page: f.page,
    })),
  });

  // Cuando se carga el form del backend (o estamos en modo nuevo), fijamos el
  // baseline del snapshot. Dirty empieza en false.
  useEffect(() => {
    if (isNew) {
      savedSnapshot.current = snapshot('', '', '', []);
      setDirty(false);
    }
  }, [isNew]);

  useEffect(() => {
    if (current && !isNew) {
      savedSnapshot.current = snapshot(
        current.title,
        current.description ?? '',
        current.context ?? '',
        [...current.fields],
      );
      setDirty(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, isNew]);

  // Compara el state local contra el baseline; si difiere, marca dirty.
  useEffect(() => {
    setDirty(snapshot(title, description, context, fields) !== savedSnapshot.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, context, fields]);

  const refreshSavedSnapshot = () => {
    savedSnapshot.current = snapshot(title, description, context, fields);
    setDirty(false);
  };

  // Aviso nativo del navegador al cerrar/recargar con cambios pendientes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // Auto-arranca el tour la primera vez que un usuario entra al editor.
  useEffect(() => {
    maybeAutoStartFormBuilderTour();
  }, []);

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

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id;
    if (typeof overId === 'string' && overId.startsWith('cell:')) {
      const data = event.over?.data.current as { row?: number; col?: number } | undefined;
      if (data?.row && data?.col) {
        setDropHead({ row: data.row, col: data.col });
        return;
      }
    }
    setDropHead(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragType(null);
    setActiveReorderId(null);
    setDropHead(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const overData = over.data.current as { row?: number; col?: number } | undefined;

    // ── Caso 1: drop sobre una celda específica del grid ────────────────
    // El campo se posiciona en (col, row) absoluto; el grid respeta el hueco
    // y permite filas vacías intencionales.
    if (overId.startsWith('cell:') && overData?.row && overData?.col) {
      const dropRow = overData.row;
      const dropCol = overData.col;

      if (activeId.startsWith(PALETTE_DRAG_PREFIX)) {
        // Crear nuevo desde la paleta y posicionarlo en la celda objetivo
        const type = activeId.replace(PALETTE_DRAG_PREFIX, '') as FieldType;
        const baseField = buildField(type);
        // Si el width default sale del grid, recortarlo a lo que queda
        const maxWidth = (12 - dropCol + 1) as FieldWidth;
        const finalWidth = (Math.min(baseField.width, maxWidth) || 1) as FieldWidth;
        const next = baseField.with({
          colStart: dropCol,
          rowStart: dropRow,
          width: finalWidth,
        });
        setFields([...fields, next].map((f, i) => f.with({ position: i })));
        setSelectedKey(next.fieldKey);
        setRightTab('inspector');
      } else {
        // Mover field existente a la celda
        const moved = visibleFields.find((f, i) => fieldSortableId(f, i) === activeId);
        if (moved) {
          const maxWidth = (12 - dropCol + 1) as FieldWidth;
          const finalWidth = (Math.min(moved.width, maxWidth) || 1) as FieldWidth;
          const updated = moved.with({
            colStart: dropCol,
            rowStart: dropRow,
            width: finalWidth,
          });
          setFields(fields.map((f) => (f === moved ? updated : f)));
        }
      }
      return;
    }

    // ── Caso 2: drop sobre otro field (mantiene reorder secuencial) ─────
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
      // Si la pestaña Workflow está montada (ref existe), guarda también el
      // workflow en la misma operación. Un click → guarda todo.
      if (workflowCanvasRef.current) {
        try {
          await workflowCanvasRef.current.save();
        } catch {
          /* el WorkflowCanvas ya muestra su propio error */
        }
      }
      refreshSavedSnapshot();
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

  /**
   * Publica formulario + workflow vinculado en un solo click:
   *   1) Guarda el form si tiene cambios pendientes.
   *   2) Si el form tiene workflow linkeado y no está PUBLISHED, lo publica.
   *   3) Publica el form.
   *
   * El editor de workflow ya guarda + auto-linkea cuando el usuario aprieta
   * "Guardar flujo" desde la pestaña Aprobaciones, así que aquí solo cerramos
   * el ciclo con los publishes.
   */
  const onPublishAll = async () => {
    if (!formId) return;
    if (!confirm('Publicar formulario y flujo de aprobación juntos. ¿Continuar?')) return;
    setPublishingAll(true);
    try {
      // Guarda primero por si hay edits sin commitear
      await saveForm({ id: formId, draft: { title, description, context, fields } });
      const wfId = current?.workflowId;
      if (wfId && currentWorkflow?.id === wfId && currentWorkflow.status !== 'PUBLISHED') {
        await publishWorkflowOne(wfId);
      }
      await publishForm(formId);
      setSavedNotice('Formulario y flujo publicados');
    } finally {
      setPublishingAll(false);
    }
  };

  const selected = useMemo(
    () => fields.find((f) => f.fieldKey === selectedKey) ?? null,
    [fields, selectedKey],
  );

  /**
   * Contexto que pasamos al editor de workflow para que el modal de transición
   * pueda ofrecer dropdowns de fieldKeys/options en condiciones CUSTOM.
   * Re-construido cada vez que cambian los fields.
   */
  const formContext = useMemo<FormContext>(() => ({
    fields: fields
      .filter((f) => !FIELD_TYPE_META[f.fieldType].presentational)
      .map((f) => ({
        fieldKey: f.fieldKey,
        label: f.label,
        fieldType: f.fieldType,
        options: parseOptionsList(f.options),
      })),
  }), [fields]);

  /**
   * Cuando el editor de workflow guarda (desde la pestaña Aprobaciones),
   * si el form todavía no está linkeado a ese workflow, lo enlazamos
   * automáticamente para que el usuario no tenga que recordarlo.
   */
  const onWorkflowSaved = async (saved: { id: number }) => {
    if (formId && current && current.workflowId !== saved.id) {
      await linkWorkflow(formId, saved.id);
    }
  };

  return (
    <AppShell fitViewport>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
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

            <button
              onClick={() => startFormBuilderTour()}
              className="ftx-icon-btn"
              title="Tour guiado del editor"
              aria-label="Ayuda"
            >
              <HelpCircle size={14} />
            </button>

            <Button
              onClick={onSave}
              disabled={saving}
              icon={<Save size={14} />}
              className="text-xs py-1.5 px-3"
              data-tour="save"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
            {!isNew && current?.status !== 'PUBLISHED' && (
              <Button variant="primary" onClick={onPublish} icon={<Send size={14} />} className="text-xs py-1.5 px-3">
                Publicar
              </Button>
            )}
            {!isNew && current?.workflowId && current?.status !== 'PUBLISHED' && (
              <Button
                onClick={onPublishAll}
                disabled={publishingAll}
                icon={<Rocket size={14} />}
                className="text-xs py-1.5 px-3 !text-success !border-success/40 hover:!bg-success/5"
                title="Publica formulario y flujo de aprobación a la vez"
              >
                {publishingAll ? 'Publicando...' : 'Publicar todo'}
              </Button>
            )}
          </div>

          {/* Main tabs: Formulario | Workflow — visibles siempre, con contraste alto */}
          <div
            data-tour="tabs"
            className="flex shrink-0 px-4 gap-1"
            style={{ background: 'var(--ftx-cream)', borderBottom: '1px solid var(--ftx-line-strong)' }}
          >
            <MainTabBtn
              active={mainTab === 'structure'}
              onClick={() => setMainTab('structure')}
              icon={<FileText size={15} />}
              label="Formulario"
              hint={`${fields.length} campos`}
            />
            <MainTabBtn
              active={mainTab === 'approval'}
              onClick={() => setMainTab('approval')}
              icon={<GitBranch size={15} />}
              label="Workflow"
              dataTour="workflow-tab"
              hint={
                isNew
                  ? 'guarda primero'
                  : current?.workflowId
                    ? (currentWorkflow?.id === current.workflowId
                        ? `${currentWorkflow.steps.length} pasos`
                        : 'enlazado')
                    : 'sin flujo'
              }
              accent={
                isNew ? 'var(--ftx-muted)'
                : current?.workflowId ? 'var(--ftx-info)'
                : 'var(--ftx-muted)'
              }
            />
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

          {/* Three-column workspace — tab "Estructura" */}
          {mainTab === 'structure' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_360px] xl:grid-cols-[280px_minmax(0,1fr)_400px] gap-0 min-h-0 overflow-hidden">
            {/* LEFT: Palette */}
            <aside
              data-tour="palette"
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
              data-tour="canvas"
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
                      <CanvasGrid
                        fields={visibleFields}
                        pageLabel={activePageLabel}
                        dropHead={dropHead}
                        dragWidth={
                          activeDragType
                            ? (FIELD_TYPE_META[activeDragType].defaultWidth as number)
                            : (() => {
                                const idx = sortableIds.indexOf(activeReorderId ?? '');
                                return idx >= 0 ? visibleFields[idx]?.width ?? 1 : 1;
                              })()
                        }
                        dragRows={
                          activeReorderId
                            ? (() => {
                                const idx = sortableIds.indexOf(activeReorderId);
                                return idx >= 0 ? visibleFields[idx]?.rows ?? 1 : 1;
                              })()
                            : 1
                        }
                      >
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
                      </CanvasGrid>
                    </SortableContext>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-muted">
                  <span>
                    canvas · 12 cols · {visibleFields.length} en {activePageLabel}
                  </span>
                  <span>arrastra borde derecho ↔ ancho · borde inferior ↕ alto</span>
                </div>

                {/* Resumen ligero del flujo enlazado — la edición real está en la pestaña Aprobaciones */}
                <FlowLinkSummary
                  workflowId={current?.workflowId ?? null}
                  onEditFlow={() => setMainTab('approval')}
                  onUnlink={async () => {
                    if (!formId) return;
                    if (!confirm('¿Desenlazar el flujo de aprobación?')) return;
                    await linkWorkflow(formId, null);
                  }}
                />
              </div>
            </section>

            {/* RIGHT: Inspector / Preview */}
            <aside
              data-tour="inspector"
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
                  label="Previsualización"
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
          )}

          {/* Workflow workspace — tab "Aprobaciones" */}
          {mainTab === 'approval' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {isNew ? (
                <div className="flex-1 grid place-items-center p-8" style={{ background: 'var(--ftx-canvas)' }}>
                  <div className="ftx-card-elev max-w-lg p-8 text-center">
                    <div
                      className="size-12 rounded-full mx-auto grid place-items-center mb-4"
                      style={{ background: 'var(--ftx-brand-tint)', border: '1px solid var(--ftx-brand)' }}
                    >
                      <GitBranch size={20} className="text-brand" />
                    </div>
                    <h2 className="font-display font-bold text-lg text-ink">
                      Guarda el formulario primero
                    </h2>
                    <p className="text-sm text-muted mt-2 leading-relaxed">
                      El flujo de aprobación se construye en relación a los campos de
                      este formulario. Cuando guardes la estructura, podrás diseñar
                      las condiciones (ej. "si tipo = compra → finanzas")
                      con autocompletado de los fieldKeys reales.
                    </p>
                    <div className="mt-5 flex items-center justify-center gap-2">
                      <Button onClick={() => setMainTab('structure')}>
                        Volver a Estructura
                      </Button>
                      <Button
                        variant="primary"
                        onClick={async () => {
                          await onSave();
                          setMainTab('approval');
                        }}
                        disabled={saving || !title.trim()}
                        icon={<Save size={14} />}
                        title={!title.trim() ? 'Pon un título antes de guardar' : 'Guardar y continuar'}
                      >
                        {saving ? 'Guardando...' : 'Guardar y continuar'}
                      </Button>
                    </div>
                    {!title.trim() && (
                      <p className="text-[11px] text-warning mt-3">
                        Ponle un título al formulario antes de guardar.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <WorkflowCanvas
                  ref={workflowCanvasRef}
                  workflowId={current?.workflowId ?? null}
                  formContext={formContext}
                  defaultName={title ? `Flujo de "${title}"` : undefined}
                  onSaved={onWorkflowSaved}
                  hideToolbar
                />
              )}
            </div>
          )}
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

      {/* Modal de confirmación al salir con cambios sin guardar */}
      {blocker.state === 'blocked' && (
        <UnsavedChangesModal
          onCancel={() => blocker.reset?.()}
          onLeave={() => blocker.proceed?.()}
          onSave={async () => {
            await onSave();
            blocker.proceed?.();
          }}
          saving={saving}
        />
      )}
    </AppShell>
  );
}

function UnsavedChangesModal({
  onCancel, onLeave, onSave, saving,
}: {
  onCancel: () => void;
  onLeave: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'grid', placeItems: 'center',
        background: 'rgba(0,0,0,0.5)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ftx-card-elev p-6 max-w-md w-full"
        style={{ background: 'var(--ftx-paper)' }}
      >
        <h2 className="font-display font-bold text-lg text-ink">
          ¿Salir sin guardar?
        </h2>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          Tienes cambios pendientes en este formulario. Si sales ahora, se
          perderán. Puedes guardarlos antes o descartarlos.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 justify-end">
          <button onClick={onCancel} className="ftx-btn">
            Cancelar
          </button>
          <button
            onClick={onLeave}
            className="ftx-btn !text-brand !border-brand/30"
          >
            Salir sin guardar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="ftx-btn ftx-btn-primary"
          >
            {saving ? 'Guardando...' : 'Guardar y salir'}
          </button>
        </div>
      </div>
    </div>
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

function MainTabBtn({
  active, onClick, icon, label, hint, accent, dataTour,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hint?: string;
  accent?: string;
  dataTour?: string;
}) {
  const color = accent ?? 'var(--ftx-brand)';
  return (
    <button
      onClick={onClick}
      data-tour={dataTour}
      className={[
        'px-5 py-3 flex items-center gap-2.5 transition-colors relative',
        'rounded-t-md',
        active ? 'text-ink' : 'text-muted hover:text-ink-2',
      ].join(' ')}
      style={{
        background: active ? 'var(--ftx-paper)' : 'transparent',
        borderTop: active ? `3px solid ${color}` : '3px solid transparent',
        borderLeft: active ? '1px solid var(--ftx-line-strong)' : '1px solid transparent',
        borderRight: active ? '1px solid var(--ftx-line-strong)' : '1px solid transparent',
        marginBottom: active ? '-1px' : '0',
        boxShadow: active ? '0 -2px 4px rgba(0,0,0,0.04)' : 'none',
      }}
    >
      <span style={{ color: active ? color : 'var(--ftx-muted)' }}>{icon}</span>
      <span className="font-display font-bold text-[15px]">{label}</span>
      {hint && (
        <span
          className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded"
          style={{
            background: active ? 'var(--ftx-cream)' : 'transparent',
            color: 'var(--ftx-muted)',
            border: active ? '1px solid var(--ftx-line)' : 'none',
          }}
        >
          {hint}
        </span>
      )}
    </button>
  );
}

/**
 * Resumen ligero del flujo enlazado dentro del tab Estructura.
 * No deja editar nada — solo muestra estado y un botón para saltar al editor
 * en la pestaña Aprobaciones.
 */
function FlowLinkSummary({
  workflowId, onEditFlow, onUnlink,
}: {
  workflowId: number | null;
  onEditFlow: () => void;
  onUnlink: () => void;
}) {
  if (!workflowId) {
    return (
      <div className="ftx-rail p-3 mt-3 flex items-center gap-2.5">
        <GitBranch size={14} style={{ color: 'var(--ftx-muted)' }} />
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
            sin flujo de aprobación
          </div>
          <div className="text-[12px] text-ink-2 mt-0.5">
            El formulario se enviará directamente al estado final.
            Crea un flujo en la pestaña <span className="text-info">Aprobaciones</span>.
          </div>
        </div>
        <Button onClick={onEditFlow} className="!text-xs !py-1 !px-2.5" icon={<GitBranch size={12} />}>
          Crear flujo
        </Button>
      </div>
    );
  }

  return (
    <div className="ftx-rail p-3 mt-3 flex items-center gap-2.5">
      <GitBranch size={14} style={{ color: 'var(--ftx-info)' }} />
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[10px] uppercase tracking-widest text-info">
          flujo de aprobación enlazado · #{workflowId}
        </div>
        <div className="text-[12px] text-ink-2 mt-0.5">
          Edita los pasos, aprobadores y condiciones en la pestaña
          <span className="text-info"> Aprobaciones</span>.
        </div>
      </div>
      <Button onClick={onEditFlow} className="!text-xs !py-1 !px-2.5">Abrir →</Button>
      <Button onClick={onUnlink} className="!text-xs !py-1 !px-2.5 !text-brand !border-brand/30">
        Desenlazar
      </Button>
    </div>
  );
}

function parseOptionsList(raw: string | null | undefined): string[] | undefined {
  if (!raw) return undefined;
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr.map(String);
  } catch {
    /* ignore */
  }
  const split = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return split.length > 0 ? split : undefined;
}

const labelForType = (type: FieldType): string => {
  const labels: Record<FieldType, string> = {
    HEADING:    'Encabezado de sección',
    PARAGRAPH:  'Párrafo de instrucciones',
    SECTION:    'Nueva sección',
    DIVIDER:    'Divisor',
    SPACER:     'Espacio',
    IMAGE:      'Imagen',
    AUTO_USER_NAME:     'Nombre completo (auto)',
    AUTO_EMPLOYEE_CODE: 'Código de empleado (auto)',
    AUTO_POSITION:      'Cargo (auto)',
    AUTO_AREA:          'Área (auto)',
    TEXT:       'Texto',
    TEXTAREA:   'Descripción',
    NUMBER:     'Número',
    EMAIL:      'Correo electrónico',
    DATE:       'Fecha',
    DATETIME:   'Fecha y hora',
    SELECT:     'Selección',
    MULTI_SELECT: 'Multi-selección',
    RADIO:      'Opción única',
    CHECKBOX:   'Confirmación',
    FILE:       'Adjunto',
    URL:        'URL',
    PHONE:      'Teléfono',
    SIGNATURE:  'Firma',
  };
  return labels[type];
};
