import type { Form } from '../models/Form';
import type { FormField } from '../models/FormField';

export interface FormDraft {
  title: string;
  description?: string | null;
  context?: string | null;
  fields: FormField[];
}

export interface IFormRepository {
  list(): Promise<Form[]>;
  getById(id: number): Promise<Form>;
  create(draft: FormDraft): Promise<Form>;
  update(id: number, draft: FormDraft): Promise<Form>;
  publish(id: number): Promise<Form>;
  remove(id: number): Promise<void>;
}
