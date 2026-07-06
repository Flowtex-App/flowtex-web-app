import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Printer, CheckCircle2, XCircle, RotateCcw, Save, Send, History, Repeat,
} from 'lucide-react';
import { AppShell } from '@/shared/ui/components/AppShell';
import { Button } from '@/shared/ui/components/Button';
import { useAuthStore } from '@/iam/interfaces/stores/auth.store';
import type { Role } from '@/iam/domain/models/User';
import { personaForStep, DEMO_PASSWORD } from '@/iam/demo/personas';
import { useSubmissionsStore } from '../stores/submissions.store';
import { Timeline } from '../components/Timeline';
import { FormFiller } from '../components/FormFiller';
import {
  STATUS_LABEL, type Decision, type SubmissionStepExecution,
} from '../../domain/models/Submission';

/**
 * /submissions/:id — vista única que cubre 3 cosas:
 *  1) Form llenado (read-only, salvo que la submission esté DRAFT/RETURNED y tú seas el solicitante)
 *  2) Timeline del workflow
 *  3) Audit log con cambios de campo, decisiones y eventos
 *
 * También expone botones para decidir un step (si tú eres aprobador), reenviar
 * tras devolución y exportar a PDF (window.print → @media print en CSS).
 */
export default function SubmissionDetailPage() {
  const { id } = useParams();
  const submissionId = id ? Number(id) : null;
  const navigate = useNavigate();
  const me = useAuthStore((s) => s.user);
  const signIn = useAuthStore((s) => s.signIn);

  const { current, loading, error, saving, loadOne, saveData, decide, resubmit, cancel } = useSubmissionsStore();
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [auditOpen, setAuditOpen] = useState(true);
  const [decisionComments, setDecisionComments] = useState('');

  useEffect(() => {
    if (submissionId) loadOne(submissionId);
  }, [submissionId, loadOne]);

  useEffect(() => {
    if (current) setValues({ ...(current.data as Record<string, unknown>) });
  }, [current]);

  // Un paso es "mío" si la asignacion coincide por usuario, por rol (tengo el rol)
  // o por area/cargo. Antes solo miraba assignedUserId, por eso los pasos
  // asignados por ROL nunca mostraban los botones de decision.
  const myExec = useMemo(() => {
    if (!current || !me) return null;
    const mine = (e: SubmissionStepExecution): boolean => {
      if (e.assignmentKind === 'USER') return e.assignedUserId != null && e.assignedUserId === me.id;
      if (e.assignmentKind === 'ROLE') return !!e.assignedRole && me.roles.includes(e.assignedRole as Role);
      if (e.assignmentKind === 'AREA_POSITION') return me.area === e.assignedArea && me.position === e.assignedPosition;
      return false;
    };
    return current.stepExecutions.find(
      (e) => (e.status === 'PENDING' || e.status === 'IN_PROGRESS') && mine(e),
    ) ?? null;
  }, [current, me]);

  // Paso pendiente (aunque no sea mio) para ofrecer el atajo demo "Actuar como".
  const pendingStep = useMemo(() => {
    if (!current) return null;
    return current.stepExecutions.find(
      (e) => e.status === 'PENDING' || e.status === 'IN_PROGRESS',
    ) ?? null;
  }, [current]);

  const switchPersona =
    pendingStep && !myExec ? personaForStep(pendingStep, me?.username) : null;

  const onSwitchPersona = async () => {
    if (!switchPersona) return;
    await signIn(switchPersona.username, DEMO_PASSWORD);
  };

  const isOwner = !!current && !!me && current.submitterId === me.id;
  const isOpenForEdit =
    isOwner &&
    !!current &&
    (current.status === 'DRAFT' || current.status === 'RETURNED');

  const onSaveData = async () => {
    if (!current) return;
    await saveData(current.id, values);
    setEditing(false);
  };

  const onDecide = async (decision: Decision) => {
    if (!current || !myExec) return;
    await decide(current.id, myExec.id, decision, decisionComments.trim() || undefined);
    setDecisionComments('');
  };

  const onResubmit = async () => {
    if (!current) return;
    await resubmit(current.id);
  };

  const onCancel = async () => {
    if (!current) return;
    if (!confirm('¿Cancelar esta solicitud? Esta acción es definitiva.')) return;
    await cancel(current.id);
  };

  const onPrint = () => window.print();

  if (loading && !current) {
    return <AppShell><div className="text-muted text-sm">Cargando...</div></AppShell>;
  }
  if (!current) {
    return <AppShell><div className="text-muted text-sm">{error ?? 'Solicitud no encontrada'}</div></AppShell>;
  }

  return (
    <AppShell>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 print:hidden">
        <button onClick={() => navigate('/submissions')} className="ftx-btn ftx-btn-ghost text-xs">
          <ArrowLeft size={13} /> Solicitudes
        </button>
        <div className="flex-1" />
        <Button onClick={onPrint} icon={<Printer size={14} />}>Imprimir / PDF</Button>
        {isOwner && current.status === 'IN_PROGRESS' && (
          <Button onClick={onCancel} className="!text-brand !border-brand/30">Cancelar</Button>
        )}
      </div>

      {/* Printable area */}
      <div id="ftx-printable" className="space-y-6">
        {/* Header */}
        <header className="ftx-card-elev p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                ticket
              </div>
              <div className="font-mono text-xl font-bold text-brand-deep mt-0.5">
                {current.ticketCode}
              </div>
            </div>
            <div className="text-right">
              <span className="ftx-tag-flat" style={{ color: statusColor(current.status), borderColor: statusColor(current.status) }}>
                {STATUS_LABEL[current.status]}
              </span>
              <div className="text-[11px] text-muted font-mono mt-1">
                Enviada el {formatDate(current.submittedAt)}
              </div>
              {current.completedAt && (
                <div className="text-[11px] text-muted font-mono">
                  Completada el {formatDate(current.completedAt)}
                </div>
              )}
            </div>
          </div>
          <h1 className="font-display font-extrabold text-2xl mt-4 text-ink">
            {current.formSnapshot?.title ?? `Formulario #${current.formId}`}
          </h1>
          {current.formSnapshot?.description && (
            <p className="text-sm text-muted mt-1.5">{current.formSnapshot.description}</p>
          )}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
            <Meta label="Solicitante"        value={current.submitterLabel ?? `#${current.submitterId}`} />
            <Meta label="Form versión"       value={`v${current.formVersion}`} />
            <Meta label="Workflow"           value={current.workflowSnapshot ? `#${current.workflowId}` : 'sin flujo'} />
            <Meta label="Pasos ejecutados"   value={`${current.stepExecutions.length}`} />
          </div>
        </header>

        {/* Aprobar / Decidir (sólo si tengo step asignado abierto) */}
        {myExec && (
          <section className="ftx-card-elev p-5 print:hidden"
                   style={{ borderLeft: '4px solid var(--ftx-brand)' }}>
            <div className="font-mono text-[10px] uppercase tracking-widest text-brand mb-1">
              acción requerida
            </div>
            <h2 className="font-display font-bold text-base text-ink">
              Estás asignado al paso <span className="text-brand">{myExec.stepLabel}</span>
            </h2>
            <textarea
              value={decisionComments}
              onChange={(e) => setDecisionComments(e.target.value)}
              rows={2}
              placeholder="Comentario (opcional)..."
              className="ftx-input mt-3 text-sm resize-y"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              <Button onClick={() => onDecide('APPROVE')} variant="primary" disabled={saving}
                      icon={<CheckCircle2 size={14} />}>Aprobar</Button>
              <Button onClick={() => onDecide('REJECT')} disabled={saving} className="!text-brand !border-brand/30"
                      icon={<XCircle size={14} />}>Rechazar</Button>
              <Button onClick={() => onDecide('RETURN')} disabled={saving} className="!text-warning !border-warning/30"
                      icon={<RotateCcw size={14} />}>Devolver al solicitante</Button>
            </div>
          </section>
        )}

        {/* Modo demo: atajo para actuar como el aprobador del paso pendiente */}
        {switchPersona && pendingStep && (
          <section className="ftx-card-elev p-5 print:hidden"
                   style={{ borderLeft: '4px solid var(--ftx-info)' }}>
            <div className="font-mono text-[10px] uppercase tracking-widest text-info mb-1">
              modo demo
            </div>
            <h2 className="font-display font-bold text-base text-ink">
              El paso <span className="text-brand">{pendingStep.stepLabel}</span> está asignado a{' '}
              {pendingStep.assignedUserLabel
                ?? (pendingStep.assignedRole ? pendingStep.assignedRole.replace('ROLE_', '') : 'un aprobador')}
            </h2>
            <p className="text-sm text-muted mt-1">
              Para decidir este paso desde la interfaz, actúa como una persona que pueda aprobarlo.
            </p>
            <div className="mt-3">
              <Button onClick={onSwitchPersona} variant="primary" disabled={saving}
                      icon={<Repeat size={14} />}>
                Actuar como {switchPersona.label}
              </Button>
            </div>
          </section>
        )}

        {/* Reenviar tras devolución */}
        {isOwner && current.status === 'RETURNED' && (
          <section className="ftx-card-elev p-5 print:hidden"
                   style={{ borderLeft: '4px solid var(--ftx-warning)' }}>
            <h2 className="font-display font-bold text-base text-ink">
              La solicitud fue devuelta para corrección
            </h2>
            <p className="text-sm text-muted mt-1">
              Edita los campos abajo y guarda; cuando esté lista, reenvía.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button onClick={() => setEditing(true)}>Editar campos</Button>
              <Button onClick={onResubmit} variant="primary" disabled={saving} icon={<Send size={14} />}>
                Reenviar
              </Button>
            </div>
          </section>
        )}

        {/* Form llenado */}
        <section className="ftx-card-elev p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-base text-ink">Formulario</h2>
            {isOpenForEdit && !editing && (
              <Button onClick={() => setEditing(true)} className="text-xs print:hidden">Editar</Button>
            )}
            {editing && (
              <div className="flex gap-2 print:hidden">
                <Button onClick={() => { setEditing(false); setValues({ ...(current.data as Record<string, unknown>) }); }}>
                  Cancelar
                </Button>
                <Button onClick={onSaveData} variant="primary" disabled={saving} icon={<Save size={14} />}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            )}
          </div>
          {current.formSnapshot ? (
            <FormFiller
              snapshot={current.formSnapshot}
              values={editing ? values : (current.data as Record<string, unknown>)}
              onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
              readOnly={!editing}
            />
          ) : (
            <div className="text-sm text-muted">Snapshot del formulario no disponible.</div>
          )}
        </section>

        {/* Timeline */}
        <section className="ftx-card-elev p-5 sm:p-6">
          <h2 className="font-display font-bold text-base text-ink mb-4">
            Línea de tiempo del flujo
          </h2>
          <Timeline submission={current} />
        </section>

        {/* Audit log */}
        <section className="ftx-card-elev p-5 sm:p-6">
          <button
            onClick={() => setAuditOpen((v) => !v)}
            className="w-full flex items-center justify-between text-left print:cursor-default"
          >
            <h2 className="font-display font-bold text-base text-ink flex items-center gap-2">
              <History size={14} className="text-brand" /> Historial completo
              <span className="ftx-tag-flat">{current.auditEvents.length}</span>
            </h2>
            <span className="text-xs text-muted print:hidden">{auditOpen ? '−' : '+'}</span>
          </button>
          {auditOpen && (
            <ul className="space-y-2 mt-4">
              {current.auditEvents.map((evt) => (
                <li key={evt.id} className="flex gap-3">
                  <span className="font-mono text-[10px] text-muted shrink-0 w-32">
                    {formatDate(evt.timestamp)}
                  </span>
                  <div className="flex-1 min-w-0 text-[12px] text-ink-2">
                    <span className="ftx-tag-flat !text-[9px] mr-1.5">{evt.eventType.replace(/_/g, ' ').toLowerCase()}</span>
                    {evt.actorLabel && <span className="text-muted">{evt.actorLabel} · </span>}
                    {evt.description ?? ''}
                    {evt.eventType === 'FIELD_CHANGED' && (
                      <div className="mt-0.5 text-[11px]">
                        <span className="font-mono text-muted">{evt.fieldLabel ?? evt.fieldKey}</span>:
                        {' '}<span className="line-through text-muted">{evt.oldValue ?? '∅'}</span>
                        {' → '}<span className="text-ink">{evt.newValue ?? '∅'}</span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
              {current.auditEvents.length === 0 && (
                <li className="text-sm text-muted italic">Sin eventos registrados.</li>
              )}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted">{label}</div>
      <div className="text-ink mt-0.5 truncate">{value}</div>
    </div>
  );
}

function statusColor(status: string): string {
  switch (status) {
    case 'APPROVED':    return 'var(--ftx-success)';
    case 'REJECTED':    return 'var(--ftx-brand)';
    case 'RETURNED':    return 'var(--ftx-warning)';
    case 'IN_PROGRESS': return 'var(--ftx-info)';
    default:            return 'var(--ftx-muted)';
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}
