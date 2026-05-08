import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { AppShell } from '@/shared/ui/components/AppShell';
import { Button } from '@/shared/ui/components/Button';
import { useFormsStore } from '@/form-builder/interfaces/stores/forms.store';
import { useSubmissionsStore } from '../stores/submissions.store';
import { FormFiller } from '../components/FormFiller';
import type { FormSnapshot } from '../../domain/models/Submission';

/**
 * Página /forms/:id/fill — el solicitante llena un formulario PUBLICADO y lo envía.
 * Al enviar, se crea una Submission, se congela el snapshot del form + workflow
 * y arranca el motor del workflow.
 */
export default function FillFormPage() {
  const { id } = useParams();
  const formId = id ? Number(id) : null;
  const navigate = useNavigate();

  const { current: form, loading, loadForm } = useFormsStore();
  const { saving, error, create } = useSubmissionsStore();
  const [values, setValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (formId) loadForm(formId);
  }, [formId, loadForm]);

  const snapshot = useMemo<FormSnapshot | null>(() => {
    if (!form) return null;
    return {
      id: form.id ?? 0,
      title: form.title,
      description: form.description ?? null,
      version: form.version,
      fields: form.fields.map((f) => ({
        id: f.id ?? null,
        label: f.label,
        fieldKey: f.fieldKey,
        fieldType: f.fieldType,
        required: f.required,
        placeholder: f.placeholder,
        helpText: f.helpText,
        position: f.position,
        width: f.width,
        colStart: f.colStart,
        rowStart: f.rowStart,
        rowSpan: f.rows,
        options: f.options,
      })),
    };
  }, [form]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId) return;
    const created = await create(formId, values);
    navigate(`/submissions/${created.id}`);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="ftx-btn ftx-btn-ghost text-xs mb-4"
        >
          <ArrowLeft size={13} /> Volver
        </button>

        {loading && <div className="text-muted text-sm">Cargando formulario...</div>}
        {!loading && !form && (
          <div className="text-muted text-sm">Formulario no encontrado.</div>
        )}

        {form && form.status !== 'PUBLISHED' && (
          <div className="ftx-card p-4 mb-4 text-sm"
               style={{ background: 'var(--ftx-brand-soft)', border: '1px solid var(--ftx-brand)' }}>
            Este formulario está en estado <strong>{form.status}</strong>. Sólo los formularios publicados
            pueden recibir solicitudes reales.
          </div>
        )}

        {form && snapshot && (
          <form onSubmit={onSubmit} className="ftx-card-elev p-6 sm:p-8 space-y-6">
            <div>
              <span className="ftx-tag ftx-tag-brand">Solicitud</span>
              <h1 className="font-display font-extrabold text-2xl mt-3 text-ink">
                {form.title}
              </h1>
              {form.description && (
                <p className="text-sm text-muted mt-1.5 leading-relaxed">{form.description}</p>
              )}
              <div className="text-[11px] font-mono text-muted mt-2">
                versión {form.version} · {snapshot.fields.length} campos
              </div>
            </div>

            <FormFiller
              snapshot={snapshot}
              values={values}
              onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
            />

            {error && (
              <div className="text-sm rounded p-3 bg-brand-soft border border-brand/30 text-brand-deep">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-line">
              <Button type="button" onClick={() => navigate(-1)}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={saving} icon={<Send size={14} />}>
                {saving ? 'Enviando...' : 'Enviar solicitud'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
