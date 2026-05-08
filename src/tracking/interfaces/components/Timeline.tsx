import {
  CheckCircle2, XCircle, Clock, RotateCcw, SkipForward, AlertCircle, User as UserIcon, Building2,
} from 'lucide-react';
import {
  STEP_STATUS_LABEL, type Submission, type SubmissionStepExecution, type WorkflowSnapshotStep,
} from '../../domain/models/Submission';
import { positionLabel } from '@/iam/domain/models/Position';
import { areaLabel } from '@/iam/domain/models/Area';

interface Props {
  submission: Submission;
}

/**
 * Timeline visual del workflow:
 *  1) Pinta los pasos ya ejecutados (en orden) con su decisión y comentarios.
 *  2) Si hay un step en cola (PENDING/IN_PROGRESS), lo muestra como "actual".
 *  3) Si el snapshot del workflow tiene más pasos posibles aún no encarrilados,
 *     los muestra como "potenciales" (gris) — útil cuando el flujo ramifica.
 */
export function Timeline({ submission }: Props) {
  const exec = submission.stepExecutions;
  const lastExec = exec[exec.length - 1] ?? null;
  const wfSteps: WorkflowSnapshotStep[] = submission.workflowSnapshot?.steps ?? [];

  // Pasos ya ejecutados quedan al inicio. Si la ejecución terminó (lastExec existe
  // y no es PENDING/IN_PROGRESS), los demás del workflow se muestran como
  // "no transitados" si la submission terminó, o "potenciales" si está abierta.
  const executedRefs = new Set(exec.map((e) => e.stepRef));
  const remaining = wfSteps
    .filter((s) => !executedRefs.has(s.ref))
    .sort((a, b) => a.position - b.position);

  return (
    <ol className="space-y-3">
      {exec.map((e) => (
        <ExecutedStep key={e.id} step={e} isLast={e === lastExec && isOpen(e.status)} />
      ))}

      {/* Pasos potenciales — sólo si el lastExec aún está abierto o la submission cerró sin pasarlos */}
      {remaining.map((s) => (
        <PotentialStep key={s.ref} step={s} ghosted={!lastExec || !isOpen(lastExec.status)} />
      ))}

      {exec.length === 0 && remaining.length === 0 && (
        <li className="text-sm text-muted italic">
          Esta solicitud no tiene workflow asociado.
        </li>
      )}
    </ol>
  );
}

function isOpen(status: SubmissionStepExecution['status']): boolean {
  return status === 'PENDING' || status === 'IN_PROGRESS';
}

function ExecutedStep({ step, isLast }: { step: SubmissionStepExecution; isLast: boolean }) {
  const meta = statusMeta(step.status);
  return (
    <li className="ftx-card p-4 flex gap-4">
      <div className="shrink-0 flex flex-col items-center">
        <div
          className="size-9 rounded-full grid place-items-center text-white"
          style={{ background: meta.color }}
          title={meta.label}
        >
          {meta.icon}
        </div>
        {!isLast && <div className="flex-1 w-px bg-line mt-2" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            paso {step.position + 1}
          </span>
          <span className="font-display font-bold text-sm text-ink truncate">
            {step.stepLabel}
          </span>
          <span
            className="ftx-tag-flat"
            style={{ color: meta.color, borderColor: meta.color }}
          >
            {STEP_STATUS_LABEL[step.status]}
          </span>
        </div>
        <div className="mt-1 text-[12px] text-ink-2 flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1">
            <AssigneeIcon kind={step.assignmentKind} />
            <AssigneeLabel step={step} />
          </span>
        </div>
        <div className="mt-1.5 text-[11px] text-muted font-mono space-y-0.5">
          <div>en cola: <span className="text-ink-2">{formatDate(step.queuedAt)}</span></div>
          {step.completedAt && (
            <div>
              {step.status === 'APPROVED' ? 'aprobado' : step.status === 'REJECTED' ? 'rechazado' : 'devuelto'} el:{' '}
              <span className="text-ink-2">{formatDate(step.completedAt)}</span>
              {step.decidedByUserId && <span className="text-ink-2"> · por {step.decidedByUserId}</span>}
            </div>
          )}
        </div>
        {step.comments && (
          <div
            className="mt-2 px-3 py-2 rounded text-[12px] leading-relaxed"
            style={{ background: 'var(--ftx-cream)', borderLeft: '3px solid var(--ftx-brand)' }}
          >
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted mr-1.5">comentario:</span>
            {step.comments}
          </div>
        )}
      </div>
    </li>
  );
}

function PotentialStep({ step, ghosted }: { step: WorkflowSnapshotStep; ghosted: boolean }) {
  return (
    <li
      className="ftx-card p-4 flex gap-4"
      style={{ opacity: ghosted ? 0.5 : 0.85, background: 'var(--ftx-cream)' }}
    >
      <div className="shrink-0">
        <div
          className="size-9 rounded-full grid place-items-center"
          style={{ background: 'var(--ftx-line)', color: 'var(--ftx-muted)' }}
          title="Paso potencial — aún no encarrilado por el flujo"
        >
          <Clock size={16} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            paso {step.position + 1} (potencial)
          </span>
          <span className="font-display font-bold text-sm text-ink truncate">
            {step.label}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-muted">
          {step.approvers.length > 0
            ? `Aprobadores: ${step.approvers.length}`
            : `Rol legacy: ${step.role}`}
          {' · modo '}
          {step.mode}
        </div>
      </div>
    </li>
  );
}

function AssigneeIcon({ kind }: { kind: SubmissionStepExecution['assignmentKind'] }) {
  if (kind === 'USER') return <UserIcon size={11} className="text-brand" />;
  if (kind === 'AREA_POSITION') return <Building2 size={11} className="text-info" />;
  return <UserIcon size={11} className="text-muted" />;
}

function AssigneeLabel({ step }: { step: SubmissionStepExecution }) {
  if (step.assignmentKind === 'USER') {
    return (
      <span>
        {step.assignedUserLabel ?? `usuario #${step.assignedUserId}`}
      </span>
    );
  }
  if (step.assignmentKind === 'AREA_POSITION') {
    return (
      <span>
        {positionLabel(step.assignedPosition as never)} de {areaLabel(step.assignedArea as never)}
      </span>
    );
  }
  return <span>{step.assignedRole}</span>;
}

function statusMeta(status: SubmissionStepExecution['status']) {
  switch (status) {
    case 'APPROVED':    return { color: 'var(--ftx-success)', icon: <CheckCircle2 size={16} />, label: 'Aprobado' };
    case 'REJECTED':    return { color: 'var(--ftx-brand)',   icon: <XCircle size={16} />,      label: 'Rechazado' };
    case 'RETURNED':    return { color: 'var(--ftx-warning)', icon: <RotateCcw size={16} />,    label: 'Devuelto' };
    case 'SKIPPED':     return { color: 'var(--ftx-muted)',   icon: <SkipForward size={16} />,  label: 'Saltado' };
    case 'IN_PROGRESS': return { color: 'var(--ftx-info)',    icon: <AlertCircle size={16} />,  label: 'En revisión' };
    case 'PENDING':
    default:            return { color: 'var(--ftx-info)',    icon: <Clock size={16} />,        label: 'En cola' };
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('es-PE', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}
