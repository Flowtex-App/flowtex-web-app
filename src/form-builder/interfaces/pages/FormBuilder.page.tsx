import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Send, Eye, EyeOff, MousePointerClick,
} from 'lucide-react';
import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor,
  useSensor, useSensors, useDroppable,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';

import { AppShell } from '@/shared/ui/components/AppShell';
import { Button } from '@/shared/ui/components/Button';
import { TextField, TextAreaField } from '@/shared/ui/components/Field';

import { FormField, slugifyFieldKey } from '../../domain/models/FormField';
import { FIELD_TYPE_META, type FieldType } from '../../domain/models/FieldType';
import { FieldPalette, PALETTE_DRAG_PREFIX } from '../components/FieldPalette';
import { FieldEditor } from '../components/FieldEditor';
import { FormPreview } from '../components/FormPreview';
import { AiSuggestionPanel } from '../components/AiSuggestionPanel';
import { useFormsStore } from '../stores/forms.store';

const CANVAS_DROP_ID = 'canvas-drop-zone';

function fieldSortableId(field: FormField, index: number): string {
  return field.id ? `field:${field.id}` : `field:tmp-${field.fieldKey}-${index}`;
}

function CanvasDroppable({
  fields,
  children,
}: {
  fields: FormField[];
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: CANVAS_DROP_ID });

  if (fields.length === 0) {
    return (
      <div
        ref={setNodeRef}
        className={[
          'ftx-drop-zone py-16 px-6 text-center transition-colors',
          isOver ? 'ftx-drop-zone-active' : '',
        ].join(' ')}
      >
        <MousePointerClick size={28} className="mx-auto text-line-strong" />
        <p className="text-sm text-ink-2 mt-3 font-medium">Arrastra un elemento aqui</p>
        <p className="text-xs text-muted mt-1">
          Toma cualquier campo del panel izquierdo y sueltalo en esta zona, o usa la IA.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={[
        'space-y-3 p-3 rounded-lg transition-colors',
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
  const [showPreview, setShowPreview] = useState(true);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<FieldType | null>(null);
  const [activeReorderId, setActiveReorderId] = useState<string | null>(null);

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

  const existingKeys = useMemo(
    () => new Set(fields.map((f) => f.fieldKey)),
    [fields],
  );

  const sortableIds = useMemo(
    () => fields.map((f, i) => fieldSortableId(f, i)),
    [fields],
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
    return new FormField({
      label: baseLabel,
      fieldKey: key,
      fieldType: type,
      required: false,
      position: fields.length,
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

    // From palette -> drop in canvas (or onto an existing field)
    if (activeId.startsWith(PALETTE_DRAG_PREFIX)) {
      const type = activeId.replace(PALETTE_DRAG_PREFIX, '') as FieldType;
      const next = buildField(type);

      const overIndex = sortableIds.indexOf(overId);
      const insertIndex = overIndex >= 0 ? overIndex + 1 : fields.length;
      const newFields = [...fields];
      newFields.splice(insertIndex, 0, next);
      setFields(newFields.map((f, i) => f.with({ position: i })));
      return;
    }

    // Reordering existing fields
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
    setFields(
      fields.filter((_, i) => i !== index).map((f, i) => f.with({ position: i })),
    );
  };

  const addFieldFromAi = (field: FormField) => {
    setFields([...fields, field.with({ position: fields.length })]);
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
    <AppShell>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <button onClick={() => navigate('/forms')} className="ftx-btn ftx-btn-ghost">
            <ArrowLeft size={15} /> Volver a la biblioteca
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="ftx-btn"
              title={showPreview ? 'Ocultar preview' : 'Mostrar preview'}
            >
              {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
              {showPreview ? 'Ocultar preview' : 'Mostrar preview'}
            </button>
            <Button onClick={onSave} disabled={saving} icon={<Save size={15} />}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
            {!isNew && current?.status !== 'PUBLISHED' && (
              <Button variant="primary" onClick={onPublish} icon={<Send size={15} />}>
                Publicar
              </Button>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="ftx-tag ftx-tag-brand">{isNew ? 'Nuevo' : 'Editar'}</span>
            {current && !isNew && (
              <>
                <span className={`ftx-tag ${current.status === 'PUBLISHED' ? 'ftx-tag-success' : 'ftx-tag-warn'}`}>
                  {current.status.toLowerCase()}
                </span>
                <span className="ftx-tag ftx-tag-muted">v{current.version}</span>
              </>
            )}
          </div>
          <h1 className="font-display font-extrabold text-2xl mt-2 text-ink">
            Creador de formularios
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Arrastra los campos desde la paleta, ordena con grip y configura cada campo en su panel.
          </p>
        </div>

        {error && (
          <div className="bg-brand-soft border border-brand/30 text-brand-deep text-sm rounded-md p-3 mb-4">
            {error}
          </div>
        )}
        {savedNotice && !error && (
          <div className="bg-success/10 border border-success/30 text-success text-sm rounded-md p-3 mb-4">
            {savedNotice}
          </div>
        )}
        {loading && !current && !isNew && <div className="text-muted">Cargando...</div>}

        {/* Layout 3 cols: palette | canvas | preview/ai */}
        <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_360px] gap-5">
          {/* Left: palette */}
          <aside className="ftx-card p-4 h-fit xl:sticky xl:top-[5rem]">
            <div className="mb-3">
              <h2 className="font-display font-bold text-sm text-ink">Elementos</h2>
              <p className="text-[11px] text-muted">Arrastra al canvas para agregar.</p>
            </div>
            <FieldPalette />
          </aside>

          {/* Middle: canvas */}
          <div className="space-y-4 min-w-0">
            <div className="ftx-card p-5 space-y-4">
              <TextField
                label="Titulo del formulario"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Solicitud de acceso a sistemas"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Descripcion corta"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Una linea explicando para que sirve"
                />
                <TextField
                  label="Codigo"
                  value={isNew ? 'auto-generado' : `FTX-${formId?.toString().padStart(4, '0')}`}
                  disabled
                />
              </div>
              <TextAreaField
                label="Contexto detallado"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Describe el proceso, los actores y lo que el formulario necesita capturar."
                rows={3}
                hint="La IA usa este contexto para sugerir campos relevantes."
              />
            </div>

            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-ink">
                Campos del formulario
              </h3>
              <span className="text-xs text-muted">{fields.length} en total</span>
            </div>

            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
              <CanvasDroppable fields={fields}>
                {fields.map((field, idx) => (
                  <FieldEditor
                    key={fieldSortableId(field, idx)}
                    field={field}
                    index={idx}
                    onChange={(next) => updateField(idx, next)}
                    onDelete={() => deleteField(idx)}
                  />
                ))}
              </CanvasDroppable>
            </SortableContext>
          </div>

          {/* Right: AI + preview */}
          <aside className="space-y-4 min-w-0">
            <AiSuggestionPanel
              formTitle={title}
              formContext={context}
              existingKeys={existingKeys}
              onPick={addFieldFromAi}
            />
            {showPreview && (
              <FormPreview title={title} description={description} fields={fields} />
            )}
          </aside>
        </div>

        {/* Drag overlay */}
        <DragOverlay dropAnimation={null}>
          {activeDragType && (
            <div className="ftx-palette-item flex items-center gap-2.5 shadow-xl border-brand">
              <div className="size-8 shrink-0 rounded-md bg-brand text-white grid place-items-center font-semibold">
                {FIELD_TYPE_META[activeDragType].glyph}
              </div>
              <div className="text-sm font-medium text-ink">
                {FIELD_TYPE_META[activeDragType].label}
              </div>
            </div>
          )}
          {activeReorderId && (() => {
            const idx = sortableIds.indexOf(activeReorderId);
            const f = idx >= 0 ? fields[idx] : null;
            if (!f) return null;
            return (
              <div className="ftx-canvas-field shadow-2xl ring-2 ring-brand bg-white">
                <div className="px-3 py-2.5 border-b border-line bg-surface-2 flex items-center gap-2">
                  <span className="size-7 rounded bg-brand-tint border border-brand/20 grid place-items-center text-brand-deep text-xs font-semibold">
                    {FIELD_TYPE_META[f.fieldType].glyph}
                  </span>
                  <span className="text-sm font-medium text-ink">{f.label}</span>
                </div>
              </div>
            );
          })()}
        </DragOverlay>
      </DndContext>
    </AppShell>
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
