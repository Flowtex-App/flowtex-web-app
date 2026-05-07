import type { FieldType } from './FieldType';

export type FieldWidth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface FormFieldProps {
  id?: number;
  label: string;
  fieldKey: string;
  fieldType: FieldType;
  required: boolean;
  placeholder?: string | null;
  helpText?: string | null;
  position: number;
  width?: FieldWidth;
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
  readonly width: FieldWidth;
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
    this.width = clampWidth(props.width ?? 12);
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
      width: this.width,
      options: this.options,
      ...overrides,
    });
  }
}

function clampWidth(w: number): FieldWidth {
  const n = Math.round(w);
  if (n < 1) return 1;
  if (n > 12) return 12;
  return n as FieldWidth;
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

export const WIDTH_PRESETS: { value: FieldWidth; label: string; hint: string }[] = [
  { value: 3,  label: '1/4',  hint: '3 cols' },
  { value: 4,  label: '1/3',  hint: '4 cols' },
  { value: 6,  label: '1/2',  hint: '6 cols' },
  { value: 8,  label: '2/3',  hint: '8 cols' },
  { value: 9,  label: '3/4',  hint: '9 cols' },
  { value: 12, label: 'Full', hint: '12 cols' },
];

export function widthClassName(width: FieldWidth): string {
  const map: Record<FieldWidth, string> = {
    1:  'col-span-12 sm:col-span-1',
    2:  'col-span-12 sm:col-span-2',
    3:  'col-span-12 sm:col-span-3',
    4:  'col-span-12 sm:col-span-4',
    5:  'col-span-12 sm:col-span-5',
    6:  'col-span-12 sm:col-span-6',
    7:  'col-span-12 sm:col-span-7',
    8:  'col-span-12 sm:col-span-8',
    9:  'col-span-12 sm:col-span-9',
    10: 'col-span-12 sm:col-span-10',
    11: 'col-span-12 sm:col-span-11',
    12: 'col-span-12',
  };
  return map[width] ?? map[12];
}
