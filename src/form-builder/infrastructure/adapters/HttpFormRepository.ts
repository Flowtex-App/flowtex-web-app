import type { AxiosInstance } from 'axios';
import { Form, type FormStatus } from '../../domain/models/Form';
import { FormField, type FieldWidth } from '../../domain/models/FormField';
import type { FieldType } from '../../domain/models/FieldType';
import type { FormDraft, IFormRepository } from '../../domain/ports/IFormRepository';

interface FormFieldDto {
  id: number;
  label: string;
  fieldKey: string;
  fieldType: FieldType;
  required: boolean;
  placeholder: string | null;
  helpText: string | null;
  position: number;
  width: number;
  options: string | null;
}

interface FormDto {
  id: number;
  title: string;
  description: string | null;
  context: string | null;
  status: FormStatus;
  version: number;
  ownerId: number;
  fields: FormFieldDto[];
  createdAt: string | null;
  updatedAt: string | null;
}

const clampWidth = (w: number): FieldWidth => {
  const n = Math.round(w);
  if (n < 1) return 1;
  if (n > 12) return 12;
  return n as FieldWidth;
};

const toForm = (dto: FormDto): Form => {
  const fields = (dto.fields ?? []).map(
    (f) =>
      new FormField({
        id: f.id,
        label: f.label,
        fieldKey: f.fieldKey,
        fieldType: f.fieldType,
        required: f.required,
        placeholder: f.placeholder,
        helpText: f.helpText,
        position: f.position,
        width: clampWidth(f.width ?? 12),
        options: f.options,
      }),
  );

  return new Form({
    id: dto.id,
    title: dto.title,
    description: dto.description,
    context: dto.context,
    status: dto.status,
    version: dto.version,
    ownerId: dto.ownerId,
    fields,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  });
};

const draftToBody = (draft: FormDraft) => ({
  title: draft.title,
  description: draft.description ?? '',
  context: draft.context ?? '',
  fields: draft.fields.map((f, idx) => ({
    label: f.label,
    fieldKey: f.fieldKey,
    fieldType: f.fieldType,
    required: f.required,
    placeholder: f.placeholder ?? '',
    helpText: f.helpText ?? '',
    position: idx,
    width: f.width,
    options: f.options ?? '',
  })),
});

export class HttpFormRepository implements IFormRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(): Promise<Form[]> {
    const { data } = await this.http.get<FormDto[]>('/forms');
    return data.map(toForm);
  }

  async getById(id: number): Promise<Form> {
    const { data } = await this.http.get<FormDto>(`/forms/${id}`);
    return toForm(data);
  }

  async create(draft: FormDraft): Promise<Form> {
    const { data } = await this.http.post<FormDto>('/forms', draftToBody(draft));
    return toForm(data);
  }

  async update(id: number, draft: FormDraft): Promise<Form> {
    const { data } = await this.http.put<FormDto>(`/forms/${id}`, draftToBody(draft));
    return toForm(data);
  }

  async publish(id: number): Promise<Form> {
    const { data } = await this.http.post<FormDto>(`/forms/${id}/publish`);
    return toForm(data);
  }

  async remove(id: number): Promise<void> {
    await this.http.delete(`/forms/${id}`);
  }
}
