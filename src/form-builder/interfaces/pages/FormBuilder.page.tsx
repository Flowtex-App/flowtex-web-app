import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Send, Eye, EyeOff } from 'lucide-react';
import { AppShell } from '@/shared/ui/components/AppShell';
import { Button } from '@/shared/ui/components/Button';
import { TextField, TextAreaField } from '@/shared/ui/components/Field';
import { FormField, slugifyFieldKey } from '../../domain/models/FormField';
import type { FieldType } from '../../domain/models/FieldType';
import { FieldPalette } from '../components/FieldPalette';
import { FieldEditor } from '../components/FieldEditor';
import { FormPreview } from '../components/FormPreview';
import { AiSuggestionPanel } from '../components/AiSuggestionPanel';
import { useFormsStore } from '../stores/forms.store';

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

  const addField = (type: FieldType) => {
    const baseLabel = labelForType(type);
    let key = slugifyFieldKey(baseLabel);
    let n = 1;
    while (existingKeys.has(key)) {
      key = `${slugifyFieldKey(baseLabel)}_${n++}`;
    }
    const newField = new FormField({
      label: baseLabel,
      fieldKey: key,
      fieldType: type,
      required: false,
      position: fields.length,
    });
    setFields([...fields, newField]);
  };

  const updateField = (index: number, next: FormField) => {
    const copy = [...fields];
    copy[index] = next;
    setFields(copy);
  };

  const deleteField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index).map((f, i) => f.with({ position: i })));
  };

  const moveField = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    const copy = [...fields];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setFields(copy.map((f, i) => f.with({ position: i })));
  };

  const onSave = async () => {
    setSavedNotice(null);
    try {
      const saved = await saveForm({
        id: isNew ? undefined : formId!,
        draft: { title, description, context, fields },
      });
      setSavedNotice('Cambios guardados correctamente');
      if (isNew) navigate(`/forms/${saved.id}`, { replace: true });
    } catch {
      // error in store
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
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <button
          onClick={() => navigate('/forms')}
          className="ftx-btn ftx-btn-ghost"
          aria-label="Volver"
        >
          <ArrowLeft size={16} /> Biblioteca
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="ftx-btn"
            title={showPreview ? 'Ocultar preview' : 'Mostrar preview'}
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />} Preview
          </button>
          <Button variant="default" onClick={onSave} disabled={saving} icon={<Save size={16} />}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
          {!isNew && current?.status !== 'PUBLISHED' && (
            <Button variant="primary" onClick={onPublish} icon={<Send size={16} />}>
              Publicar
            </Button>
          )}
        </div>
      </div>

      <header className="mb-5 flex items-center gap-3 flex-wrap">
        <span className="ftx-tag ftx-tag-flame">{isNew ? 'nuevo' : 'editar'}</span>
        {current && !isNew && (
          <>
            <span className={`ftx-tag ${current.status === 'PUBLISHED' ? 'ftx-tag-mint' : 'ftx-tag-blush'}`}>
              {current.status.toLowerCase()}
            </span>
            <span className="ftx-tag">v{current.version}</span>
          </>
        )}
        <h1 className="font-display font-bold text-3xl tracking-tight">
          {isNew ? 'Nuevo formulario' : title || 'Sin titulo'}
        </h1>
      </header>

      {error && (
        <div className="border-[3px] border-flame bg-blush p-3 mb-4 font-medium">{error}</div>
      )}
      {savedNotice && !error && (
        <div className="border-[3px] border-mint bg-mint/20 p-3 mb-4 font-medium">{savedNotice}</div>
      )}
      {loading && !current && !isNew && <div className="text-ink/50">Cargando...</div>}

      <div className="grid xl:grid-cols-[1.4fr_1fr] gap-6">
        {/* Builder column */}
        <div className="space-y-5">
          {/* Meta */}
          <div className="ftx-card p-6 space-y-4">
            <span className="ftx-tag ftx-tag-citron">metadatos</span>
            <TextField
              label="Titulo del formulario"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Solicitud de acceso a sistemas"
              required
            />
            <TextField
              label="Descripcion corta"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Una linea explicando para que sirve"
            />
            <TextAreaField
              label="Contexto detallado"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe el proceso, los actores y lo que el formulario necesita capturar. La IA usara este contexto."
              rows={4}
              hint="Cuanto mas claro sea el contexto, mejores seran las sugerencias de la IA."
            />
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="ftx-tag ftx-tag-violet">campos</span>
              <span className="text-xs font-mono text-ink/60">{fields.length} en total</span>
            </div>

            {fields.length === 0 && (
              <div className="ftx-card p-12 text-center border-dashed">
                <p className="text-ink/60">Aun no hay campos. Anade desde la paleta o pide sugerencias a la IA.</p>
              </div>
            )}

            {fields.map((field, idx) => (
              <FieldEditor
                key={`${field.fieldKey}-${idx}`}
                field={field}
                index={idx}
                total={fields.length}
                onChange={(next) => updateField(idx, next)}
                onDelete={() => deleteField(idx)}
                onMove={(dir) => moveField(idx, dir)}
              />
            ))}
          </div>
        </div>

        {/* Sidebar column */}
        <aside className="space-y-5">
          <FieldPalette onAdd={addField} />
          <AiSuggestionPanel
            formTitle={title}
            formContext={context}
            existingKeys={existingKeys}
            onPick={(field) => setFields([...fields, field.with({ position: fields.length })])}
          />
          {showPreview && (
            <FormPreview title={title} description={description} fields={fields} />
          )}
        </aside>
      </div>
    </AppShell>
  );
}

const labelForType = (type: FieldType): string => {
  const labels: Record<FieldType, string> = {
    TEXT: 'Nuevo campo de texto',
    TEXTAREA: 'Nueva descripcion',
    NUMBER: 'Nuevo campo numerico',
    EMAIL: 'Correo electronico',
    DATE: 'Nueva fecha',
    DATETIME: 'Nueva fecha y hora',
    SELECT: 'Nueva lista',
    MULTI_SELECT: 'Nueva lista multiple',
    RADIO: 'Nueva opcion unica',
    CHECKBOX: 'Nuevo checkbox',
    FILE: 'Nuevo adjunto',
    URL: 'Nueva URL',
    PHONE: 'Nuevo telefono',
    SIGNATURE: 'Nueva firma',
  };
  return labels[type];
};
