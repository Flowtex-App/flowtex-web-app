import type { AxiosInstance } from 'axios';
import {
  Workflow, type ApproverKind, type ConditionKind, type HandleSide, type SectionKind, type StepColor, type StepMode,
  type WorkflowDraft, type WorkflowStatus, newStepTempId,
} from '../../domain/models/Workflow';
import type { IWorkflowRepository } from '../../domain/ports/IWorkflowRepository';

interface SectionDto {
  id: number;
  position: number;
  sectionKind: string;
  label: string;
  required: boolean;
  config: string | null;
}
interface TransitionDto {
  id: number;
  fromStepId: number | null;
  toStepId: number | null;
  conditionKind: string;
  label: string | null;
  position: number;
  config: string | null;
  sourceHandle: string | null;
  targetHandle: string | null;
}
interface ApproverDto {
  id: number;
  position: number;
  kind: string;
  userId: number | null;
  area: string | null;
  userPosition: string | null;
  role: string | null;
  userLabel: string | null;
  userEmployeeCode: string | null;
}
interface StepDto {
  id: number;
  position: number;
  label: string;
  role: string;
  slaHours: number;
  mode: string;
  description: string | null;
  canvasX: number;
  canvasY: number;
  color: string | null;
  sections: SectionDto[];
  transitions: TransitionDto[];
  approvers: ApproverDto[];
}
interface WorkflowDto {
  id: number;
  name: string;
  description: string | null;
  status: WorkflowStatus;
  ownerId: number | null;
  steps: StepDto[];
  createdAt: string | null;
  updatedAt: string | null;
}

const VALID_HANDLES: HandleSide[] = ['top', 'right', 'bottom', 'left'];
const asHandle = (raw: string | null | undefined): HandleSide | null => {
  if (raw && (VALID_HANDLES as string[]).includes(raw)) return raw as HandleSide;
  return null;
};

const VALID_COLORS: StepColor[] = ['slate', 'emerald', 'amber', 'rose', 'sky', 'violet'];
const asColor = (raw: string | null | undefined): StepColor | null => {
  if (raw && (VALID_COLORS as string[]).includes(raw)) return raw as StepColor;
  return null;
};

const toWorkflow = (dto: WorkflowDto): Workflow => {
  const steps = (dto.steps ?? []).map((s) => ({
    id: s.id,
    tempId: `tmp-${s.id}`,
    position: s.position,
    label: s.label,
    role: s.role,
    slaHours: s.slaHours,
    mode: s.mode as StepMode,
    description: s.description,
    canvasX: s.canvasX ?? 0,
    canvasY: s.canvasY ?? 0,
    color: asColor(s.color),
    sections: (s.sections ?? []).map((sec) => ({
      id: sec.id,
      position: sec.position,
      sectionKind: sec.sectionKind as SectionKind,
      label: sec.label,
      required: sec.required,
      config: sec.config,
    })),
    transitions: (s.transitions ?? []).map((t) => ({
      id: t.id,
      toStepId: t.toStepId,
      toStepRef: t.toStepId ? `tmp-${t.toStepId}` : null,
      conditionKind: t.conditionKind as ConditionKind,
      label: t.label,
      position: t.position,
      config: t.config,
      sourceHandle: asHandle(t.sourceHandle),
      targetHandle: asHandle(t.targetHandle),
    })),
    approvers: (s.approvers ?? []).map((a) => ({
      id: a.id,
      position: a.position,
      kind: a.kind as ApproverKind,
      userId: a.userId,
      area: a.area,
      userPosition: a.userPosition,
      role: a.role,
      userLabel: a.userLabel ?? undefined,
      userEmployeeCode: a.userEmployeeCode ?? undefined,
    })),
  }));
  return new Workflow({
    id: dto.id,
    name: dto.name,
    description: dto.description,
    status: dto.status,
    ownerId: dto.ownerId,
    steps,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  });
};

const draftToBody = (draft: WorkflowDraft) => ({
  name: draft.name,
  description: draft.description ?? '',
  steps: draft.steps.map((s, idx) => ({
    tempId: s.tempId ?? newStepTempId(),
    id: s.id ?? null,
    position: idx,
    label: s.label,
    role: s.role,
    slaHours: s.slaHours,
    mode: s.mode,
    description: s.description ?? '',
    canvasX: Math.round(s.canvasX),
    canvasY: Math.round(s.canvasY),
    color: s.color ?? null,
    sections: s.sections.map((sec, secIdx) => ({
      id: sec.id ?? null,
      position: secIdx,
      sectionKind: sec.sectionKind,
      label: sec.label,
      required: sec.required,
      config: sec.config ?? null,
    })),
    transitions: s.transitions.map((t, tIdx) => ({
      id: t.id ?? null,
      toStepRef: t.toStepRef ?? null,
      conditionKind: t.conditionKind,
      label: t.label ?? '',
      position: tIdx,
      config: t.config ?? null,
      sourceHandle: t.sourceHandle ?? null,
      targetHandle: t.targetHandle ?? null,
    })),
    approvers: (s.approvers ?? []).map((a, aIdx) => ({
      id: a.id ?? null,
      position: aIdx,
      kind: a.kind,
      userId: a.userId,
      area: a.area,
      userPosition: a.userPosition,
      role: a.role,
    })),
  })),
});

export class HttpWorkflowRepository implements IWorkflowRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(): Promise<Workflow[]> {
    const { data } = await this.http.get<WorkflowDto[]>('/workflows');
    return data.map(toWorkflow);
  }

  async getById(id: number): Promise<Workflow> {
    const { data } = await this.http.get<WorkflowDto>(`/workflows/${id}`);
    return toWorkflow(data);
  }

  async create(draft: WorkflowDraft): Promise<Workflow> {
    const { data } = await this.http.post<WorkflowDto>('/workflows', draftToBody(draft));
    return toWorkflow(data);
  }

  async update(id: number, draft: WorkflowDraft): Promise<Workflow> {
    const { data } = await this.http.put<WorkflowDto>(`/workflows/${id}`, draftToBody(draft));
    return toWorkflow(data);
  }

  async publish(id: number): Promise<Workflow> {
    const { data } = await this.http.post<WorkflowDto>(`/workflows/${id}/publish`);
    return toWorkflow(data);
  }

  async remove(id: number): Promise<void> {
    await this.http.delete(`/workflows/${id}`);
  }
}
