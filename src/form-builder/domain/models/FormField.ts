import type { FieldType } from './FieldType';

export interface FormFieldProps {
  id?: number;
  label: string;
  fieldKey: string;
  fieldType: FieldType;
  required: boolean;
  placeholder?: string | null;
  helpText?: string | null;
  position: number;
  options?: string | null;
}

export class FormField {
  readonly id?: number;
  readonly label: string;
  readonly fieldKey: string;
  readonly fieldType: FieldType;
  readonly required: boolean;
  readonly placeholder: string | null;
  readonly helpText: string | null;
  readonly position: number;
  readonly options: string | null;

  constructor(props: FormFieldProps) {
    if (!props.label?.trim()) throw new Error('label is required');
    if (!props.fieldKey?.trim()) throw new Error('fieldKey is required');
    this.id = props.id;
    this.label = props.label;
    this.fieldKey = props.fieldKey;
    this.fieldType = props.fieldType;
    this.required = props.required;
    this.placeholder = props.placeholder ?? null;
    this.helpText = props.helpText ?? null;
    this.position = props.position;
    this.options = props.options ?? null;
  }

  optionsList(): string[] {
    if (!this.options) return [];
    try {
      const parsed = JSON.parse(this.options);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return this.options.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  with(overrides: Partial<FormFieldProps>): FormField {
    return new FormField({
      id: this.id,
      label: this.label,
      fieldKey: this.fieldKey,
      fieldType: this.fieldType,
      required: this.required,
      placeholder: this.placeholder,
      helpText: this.helpText,
      position: this.position,
      options: this.options,
      ...overrides,
    });
  }
}

export const slugifyFieldKey = (label: string): string => {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 60);
};
