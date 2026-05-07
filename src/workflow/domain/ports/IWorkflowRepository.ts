import { Workflow, WorkflowDraft } from '../models/Workflow';

export interface IWorkflowRepository {
  list(): Promise<Workflow[]>;
  getById(id: number): Promise<Workflow>;
  create(draft: WorkflowDraft): Promise<Workflow>;
  update(id: number, draft: WorkflowDraft): Promise<Workflow>;
  publish(id: number): Promise<Workflow>;
  remove(id: number): Promise<void>;
}
