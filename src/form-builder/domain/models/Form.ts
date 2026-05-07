import { FormField } from './FormField';

export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface FormProps {
  id: number;
  title: string;
  description: string | null;
  context: string | null;
  status: FormStatus;
  version: number;
  ownerId: number;
  fields: FormField[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export class Form {
  readonly id: number;
  readonly title: string;
  readonly description: string | null;
  readonly context: string | null;
  readonly status: FormStatus;
  readonly version: number;
  readonly ownerId: number;
  readonly fields: readonly FormField[];
  readonly createdAt: string | null;
  readonly updatedAt: string | null;

  constructor(props: FormProps) {
    if (!props.title?.trim()) throw new Error('title is required');
    this.id = props.id;
    this.title = props.title;
    this.description = props.description ?? null;
    this.context = props.context ?? null;
    this.status = props.status;
    this.version = props.version;
    this.ownerId = props.ownerId;
    this.fields = Object.freeze([...props.fields]);
    this.createdAt = props.createdAt ?? null;
    this.updatedAt = props.updatedAt ?? null;
  }

  isPublished(): boolean {
    return this.status === 'PUBLISHED';
  }

  fieldCount(): number {
    return this.fields.length;
  }
}
