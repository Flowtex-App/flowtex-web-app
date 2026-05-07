export type WorkflowStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type StepMode = 'SEQUENTIAL' | 'PARALLEL' | 'MAJORITY';
export type SectionKind = 'COMMENTS' | 'DECISION' | 'EVIDENCE' | 'CHECKLIST' | 'SLA_TIMER';
export type ConditionKind = 'ALWAYS' | 'ON_APPROVE' | 'ON_REJECT' | 'ON_RETURN' | 'CUSTOM';

export interface SectionKindMeta {
  id: SectionKind;
  label: string;
  description: string;
  glyph: string;
  defaultLabel: string;
}

export const SECTION_KIND_META: Record<SectionKind, SectionKindMeta> = {
  COMMENTS:  { id: 'COMMENTS',  label: 'Comentarios',  description: 'Caja de texto libre del aprobador',           glyph: '💬', defaultLabel: 'Comentarios del aprobador' },
  DECISION:  { id: 'DECISION',  label: 'Decisión',     description: 'Aprobar / Rechazar / Devolver',               glyph: '✓',  defaultLabel: 'Decisión' },
  EVIDENCE:  { id: 'EVIDENCE',  label: 'Evidencia',    description: 'Adjunto requerido para sustentar la acción',  glyph: '📎', defaultLabel: 'Evidencia adjunta' },
  CHECKLIST: { id: 'CHECKLIST', label: 'Checklist',    description: 'Lista de verificación obligatoria',           glyph: '☑',  defaultLabel: 'Checklist de validación' },
  SLA_TIMER: { id: 'SLA_TIMER', label: 'SLA timer',    description: 'Cronómetro visible del tiempo restante',      glyph: '⏱',  defaultLabel: 'Tiempo restante (SLA)' },
};

export const STEP_MODE_META: Record<StepMode, { label: string; description: string }> = {
  SEQUENTIAL: { label: 'Secuencial', description: 'Un aprobador a la vez en orden' },
  PARALLEL:   { label: 'Paralelo',   description: 'Todos los aprobadores simultáneamente; todos deben aprobar' },
  MAJORITY:   { label: 'Mayoría',    description: 'Aprobación si la mayoría aprueba antes del SLA' },
};

export const CONDITION_META: Record<ConditionKind, { label: string; hint: string; color: string }> = {
  ALWAYS:     { label: 'Siempre',         hint: 'La transición se toma sin condición',  color: '#475569' },
  ON_APPROVE: { label: 'Si aprueba',      hint: 'Cuando el aprobador da OK',            color: '#0D9460' },
  ON_REJECT:  { label: 'Si rechaza',      hint: 'Cuando el aprobador rechaza',          color: '#DA291C' },
  ON_RETURN:  { label: 'Si devuelve',     hint: 'Cuando solicita correcciones',         color: '#C97A0A' },
  CUSTOM:     { label: 'Expresión',       hint: 'Condición personalizada (ej. monto)',  color: '#1F5FB8' },
};

export interface WorkflowStepSection {
  id?: number;
  position: number;
  sectionKind: SectionKind;
  label: string;
  required: boolean;
  config: string | null;
}

export type HandleSide = 'top' | 'right' | 'bottom' | 'left';

export interface WorkflowStepTransition {
  id?: number;
  toStepId: number | null;
  toStepRef?: string | null;
  conditionKind: ConditionKind;
  label: string | null;
  position: number;
  config: string | null;
  /** Side of the source node where this edge originates. */
  sourceHandle: HandleSide | null;
  /** Side of the target node where this edge ends. */
  targetHandle: HandleSide | null;
}

export type StepColor = 'slate' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';

export interface StepColorMeta {
  id: StepColor;
  label: string;
  /** Border accent color for the step tile. */
  border: string;
  /** Soft background tint behind the step tile. */
  tint: string;
  /** Strong color for the side accent stripe & badge. */
  strong: string;
}

export const STEP_COLORS: StepColorMeta[] = [
  { id: 'slate',   label: 'Neutro',   border: '#475569', tint: '#F1F5F9', strong: '#334155' },
  { id: 'emerald', label: 'Aprobar',  border: '#0D9460', tint: '#DEF7E9', strong: '#0D9460' },
  { id: 'amber',   label: 'Revisar',  border: '#C97A0A', tint: '#FFF1D6', strong: '#B5680A' },
  { id: 'rose',    label: 'Decidir',  border: '#DA291C', tint: '#FDE6E4', strong: '#DA291C' },
  { id: 'sky',     label: 'Informar', border: '#1F5FB8', tint: '#DCEAFB', strong: '#1F5FB8' },
  { id: 'violet',  label: 'Custodia', border: '#6D28D9', tint: '#EBDDFD', strong: '#6D28D9' },
];

export function colorMeta(c: StepColor | null | undefined): StepColorMeta {
  return STEP_COLORS.find((x) => x.id === c) ?? STEP_COLORS[0];
}

export interface WorkflowStep {
  id?: number;
  /** Stable client-side ref (used as React Flow node id and for transition wiring). */
  tempId: string;
  position: number;
  label: string;
  role: string;
  slaHours: number;
  mode: StepMode;
  description: string | null;
  canvasX: number;
  canvasY: number;
  /** Curated color name. Null = slate (default). */
  color: StepColor | null;
  sections: WorkflowStepSection[];
  transitions: WorkflowStepTransition[];
}

export interface WorkflowProps {
  id: number;
  name: string;
  description: string | null;
  status: WorkflowStatus;
  ownerId: number | null;
  steps: WorkflowStep[];
  createdAt: string | null;
  updatedAt: string | null;
}

export class Workflow {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly status: WorkflowStatus;
  readonly ownerId: number | null;
  readonly steps: readonly WorkflowStep[];
  readonly createdAt: string | null;
  readonly updatedAt: string | null;

  constructor(props: WorkflowProps) {
    if (!props.name?.trim()) throw new Error('name is required');
    this.id = props.id;
    this.name = props.name;
    this.description = props.description ?? null;
    this.status = props.status;
    this.ownerId = props.ownerId ?? null;
    this.steps = Object.freeze(props.steps.map((s) => ({
      ...s,
      sections: [...s.sections],
      transitions: [...s.transitions],
    })));
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isPublished(): boolean { return this.status === 'PUBLISHED'; }
}

export interface WorkflowDraft {
  name: string;
  description: string;
  steps: WorkflowStep[];
}

export const DEFAULT_ROLES = [
  { id: 'ROLE_USER',     label: 'Usuario' },
  { id: 'ROLE_APPROVER', label: 'Aprobador' },
  { id: 'ROLE_DESIGNER', label: 'Diseñador' },
  { id: 'ROLE_ADMIN',    label: 'Admin' },
];

export function newStepTempId(): string {
  return `tmp-${Math.random().toString(36).slice(2, 10)}`;
}

export function newStep(position: number, x = 240, y = 160): WorkflowStep {
  return {
    tempId: newStepTempId(),
    position,
    label: `Paso ${position + 1}`,
    role: 'ROLE_APPROVER',
    slaHours: 48,
    mode: 'SEQUENTIAL',
    description: null,
    canvasX: x,
    canvasY: y,
    color: null,
    sections: [],
    transitions: [],
  };
}

export function newSection(kind: SectionKind, position: number): WorkflowStepSection {
  const meta = SECTION_KIND_META[kind];
  return {
    position,
    sectionKind: kind,
    label: meta.defaultLabel,
    required: kind === 'DECISION',
    config: null,
  };
}

export function newTransition(toStepRef: string | null, condition: ConditionKind = 'ALWAYS', position = 0): WorkflowStepTransition {
  return {
    toStepId: null,
    toStepRef,
    conditionKind: condition,
    label: null,
    position,
    config: null,
    sourceHandle: null,
    targetHandle: null,
  };
}
