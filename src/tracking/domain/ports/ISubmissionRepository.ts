import type { Decision, Submission } from '../models/Submission';

export interface ISubmissionRepository {
  list(scope: 'mine' | 'assigned' | 'all'): Promise<Submission[]>;
  getById(id: number): Promise<Submission>;
  getByTicket(ticket: string): Promise<Submission>;
  create(formId: number, data: Record<string, unknown>): Promise<Submission>;
  updateData(id: number, data: Record<string, unknown>): Promise<Submission>;
  decide(id: number, execId: number, decision: Decision, comments?: string): Promise<Submission>;
  cancel(id: number): Promise<void>;
  resubmit(id: number): Promise<Submission>;
}
