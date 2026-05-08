import type { AxiosInstance } from 'axios';
import type { Decision, Submission } from '../../domain/models/Submission';
import type { ISubmissionRepository } from '../../domain/ports/ISubmissionRepository';

export class HttpSubmissionRepository implements ISubmissionRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(scope: 'mine' | 'assigned' | 'all'): Promise<Submission[]> {
    const { data } = await this.http.get<Submission[]>('/submissions', {
      params: { scope },
    });
    return data;
  }

  async getById(id: number): Promise<Submission> {
    const { data } = await this.http.get<Submission>(`/submissions/${id}`);
    return data;
  }

  async getByTicket(ticket: string): Promise<Submission> {
    const { data } = await this.http.get<Submission>(`/submissions/by-ticket/${ticket}`);
    return data;
  }

  async create(formId: number, payload: Record<string, unknown>): Promise<Submission> {
    const { data } = await this.http.post<Submission>('/submissions', { formId, data: payload });
    return data;
  }

  async updateData(id: number, payload: Record<string, unknown>): Promise<Submission> {
    const { data } = await this.http.put<Submission>(`/submissions/${id}/data`, { data: payload });
    return data;
  }

  async decide(id: number, execId: number, decision: Decision, comments?: string): Promise<Submission> {
    const { data } = await this.http.post<Submission>(
      `/submissions/${id}/steps/${execId}/decide`,
      { decision, comments: comments ?? null },
    );
    return data;
  }

  async cancel(id: number): Promise<void> {
    await this.http.post(`/submissions/${id}/cancel`);
  }

  async resubmit(id: number): Promise<Submission> {
    const { data } = await this.http.post<Submission>(`/submissions/${id}/resubmit`);
    return data;
  }
}
