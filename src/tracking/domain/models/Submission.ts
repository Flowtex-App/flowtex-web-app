/**
 * Bounded context Tracking — domain models del lado frontend.
 *
 * Una Submission representa una solicitud (formulario llenado + ejecución del
 * workflow). Toda la información viaja en snapshots persistidos: el formulario
 * y el workflow originales pueden cambiar después sin afectar a la solicitud.
 */

export type SubmissionStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED'
  | 'CANCELED';

export type StepExecutionStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED'
  | 'SKIPPED';

export type Decision = 'APPROVE' | 'REJECT' | 'RETURN';

export type AssignmentKind = 'USER' | 'AREA_POSITION' | 'ROLE';

export type AuditEventType =
  | 'CREATED'
  | 'SUBMITTED'
  | 'FIELD_CHANGED'
  | 'COMMENTED'
  | 'STEP_ASSIGNED'
  | 'STEP_APPROVED'
  | 'STEP_REJECTED'
  | 'STEP_RETURNED'
  | 'STEP_SKIPPED'
  | 'WORKFLOW_COMPLETED'
  | 'RESUBMITTED'
  | 'CANCELED';

export interface FormSnapshotField {
  id: number | null;
  label: string;
  fieldKey: string;
  fieldType: string;
  required: boolean;
  placeholder: string | null;
  helpText: string | null;
  position: number;
  width: number;
  colStart: number | null;
  rowStart: number | null;
  rowSpan: number;
  options: string | null;
}

export interface FormSnapshot {
  id: number;
  title: string;
  description: string | null;
  version: number;
  fields: FormSnapshotField[];
}

export interface WorkflowSnapshotApprover {
  kind: AssignmentKind;
  userId: number | null;
  userLabel?: string | null;
  userEmployeeCode?: string | null;
  area: string | null;
  userPosition: string | null;
  role: string | null;
}

export interface WorkflowSnapshotTransition {
  toStepRef: string | null;
  conditionKind: 'ALWAYS' | 'ON_APPROVE' | 'ON_REJECT' | 'ON_RETURN' | 'CUSTOM';
  label: string | null;
  position: number;
  config: string | null;
}

export interface WorkflowSnapshotStep {
  ref: string;
  label: string;
  position: number;
  role: string | null;
  mode: 'SEQUENTIAL' | 'PARALLEL' | 'MAJORITY';
  approvers: WorkflowSnapshotApprover[];
  transitions: WorkflowSnapshotTransition[];
}

export interface WorkflowSnapshot {
  id: number;
  name: string;
  steps: WorkflowSnapshotStep[];
}

export interface SubmissionStepExecution {
  id: number;
  stepRef: string;
  stepLabel: string;
  position: number;
  assignmentKind: AssignmentKind;
  assignedUserId: number | null;
  assignedUserLabel: string | null;
  assignedArea: string | null;
  assignedPosition: string | null;
  assignedRole: string | null;
  status: StepExecutionStatus;
  decision: Decision | null;
  comments: string | null;
  queuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  decidedByUserId: number | null;
}

export interface SubmissionAuditEvent {
  id: number;
  eventType: AuditEventType;
  actorUserId: number | null;
  actorLabel: string | null;
  fieldKey: string | null;
  fieldLabel: string | null;
  oldValue: string | null;
  newValue: string | null;
  description: string | null;
  timestamp: string;
}

export interface Submission {
  id: number;
  ticketCode: string;
  formId: number;
  formVersion: number;
  workflowId: number | null;
  submitterId: number;
  submitterLabel: string | null;
  status: SubmissionStatus;
  data: Record<string, unknown>;
  formSnapshot: FormSnapshot | null;
  workflowSnapshot: WorkflowSnapshot | null;
  currentStepRef: string | null;
  submittedAt: string;
  completedAt: string | null;
  stepExecutions: SubmissionStepExecution[];
  auditEvents: SubmissionAuditEvent[];
}

export const STATUS_LABEL: Record<SubmissionStatus, string> = {
  DRAFT: 'Borrador',
  IN_PROGRESS: 'En revisión',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  RETURNED: 'Devuelto',
  CANCELED: 'Cancelado',
};

export const STEP_STATUS_LABEL: Record<StepExecutionStatus, string> = {
  PENDING: 'En cola',
  IN_PROGRESS: 'En revisión',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  RETURNED: 'Devuelto',
  SKIPPED: 'Saltado',
};
