import type { FieldType } from './FieldType';

export type FieldWidth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** Page identifier within a form (form-level wizard tabs). */
export type PageId = string;

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
  /** Explicit grid column (1..12). Null = flow naturally. */
  colStart?: number | null;
  /** Explicit grid row (1..). Null = flow naturally. */
  rowStart?: number | null;
  /** Vertical row span (1..6) — also feeds backend rowSpan. */
  rowSpan?: number | null;
  options?: string | null;
}

interface EmbeddedMeta {
  /** Page id within the form (e.g. 'p1', 'p2'). */
  page: PageId;
  /** Visual rows occupied by the tile (UI only). */
  rows: number;
}

const META_PREFIX = '​__ftx:';
const META_SUFFIX = '__';
const META_RX = /^​__ftx:(\{.*?\})__/;

const DEFAULT_PAGE: PageId = 'p1';
const DEFAULT_META: EmbeddedMeta = { page: DEFAULT_PAGE, rows: 1 };

function parseMeta(raw: string | null | undefined): { meta: EmbeddedMeta; rest: string } {
  if (!raw) return { meta: { ...DEFAULT_META }, rest: '' };
  const match = raw.match(META_RX);
  if (!match) return { meta: { ...DEFAULT_META }, rest: raw };
  try {
    const parsed = JSON.parse(match[1]);
    // Backwards-compat: previous version used 'step' (main / approval-1 / approval-2)
    const pageRaw = typeof parsed.page === 'string' && parsed.page.length > 0
      ? parsed.page
      : (typeof parsed.step === 'string' ? mapStepToPage(parsed.step) : DEFAULT_PAGE);
    const meta: EmbeddedMeta = {
      page: pageRaw,
      rows:
        typeof parsed.rows === 'number' && parsed.rows >= 1 && parsed.rows <= 6
          ? Math.round(parsed.rows)
          : 1,
    };
    return { meta, rest: raw.slice(match[0].length) };
  } catch {
    return { meta: { ...DEFAULT_META }, rest: raw };
  }
}

function mapStepToPage(step: string): PageId {
  // Old "approval steps" don't make sense in the new model — collapse them all to p1.
  if (step === 'approval-1' || step === 'approval-2' || step === 'main') return DEFAULT_PAGE;
  return DEFAULT_PAGE;
}

function serializeMeta(meta: EmbeddedMeta, rest: string | null | undefined): string | null {
  const isDefault = meta.page === DEFAULT_PAGE && meta.rows === 1;
  const cleaned = (rest ?? '').trimStart();
  if (isDefault) return cleaned ? cleaned : null;
  return `${META_PREFIX}${JSON.stringify({ page: meta.page, rows: meta.rows })}${META_SUFFIX}${cleaned}`;
}

export class FormField {
  readonly id?: number;
  readonly label: string;
  readonly fieldKey: string;
  readonly fieldType: FieldType;
  readonly required: boolean;
  readonly placeholder: string | null;
  readonly position: number;
  readonly width: FieldWidth;
  readonly options: string | null;

  /** Raw helpText including the embedded meta marker. Persisted as-is. */
  readonly rawHelpText: string | null;
  /** User-facing help text (without the meta marker). */
  readonly helpText: string | null;

  /** Page (wizard tab) the field belongs to. */
  readonly page: PageId;
  /** Visual rows occupied (1-6). Also persisted as `rowSpan` on backend. */
  readonly rows: number;
  /** Explicit column start (1..12) or null when flowing naturally. */
  readonly colStart: number | null;
  /** Explicit row start (1..) or null when flowing naturally. */
  readonly rowStart: number | null;

  constructor(props: FormFieldProps) {
    if (!props.label?.trim()) throw new Error('label is required');
    if (!props.fieldKey?.trim()) throw new Error('fieldKey is required');

    const raw = props.helpText ?? null;
    const { meta, rest } = parseMeta(raw);

    this.id = props.id;
    this.label = props.label;
    this.fieldKey = props.fieldKey;
    this.fieldType = props.fieldType;
    this.required = props.required;
    this.placeholder = props.placeholder ?? null;
    this.rawHelpText = raw;
    this.helpText = rest ? rest : null;
    this.position = props.position;
    this.width = clampWidth(props.width ?? 12);
    this.options = props.options ?? null;
    this.page = meta.page;
    this.rows = props.rowSpan != null ? clampRows(props.rowSpan) : meta.rows;
    this.colStart = clampOptCol(props.colStart);
    this.rowStart = clampOptRow(props.rowStart);
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

  with(overrides: Partial<FormFieldProps & { page: PageId; rows: number }>): FormField {
    const nextHelp = 'helpText' in overrides ? overrides.helpText ?? null : this.helpText;
    const nextPage: PageId = overrides.page ?? this.page;
    const nextRows = overrides.rows ?? overrides.rowSpan ?? this.rows;
    const merged: EmbeddedMeta = { page: nextPage, rows: clampRows(nextRows) };
    const serialized = serializeMeta(merged, nextHelp);

    return new FormField({
      id: 'id' in overrides ? overrides.id : this.id,
      label: overrides.label ?? this.label,
      fieldKey: overrides.fieldKey ?? this.fieldKey,
      fieldType: overrides.fieldType ?? this.fieldType,
      required: overrides.required ?? this.required,
      placeholder: 'placeholder' in overrides ? overrides.placeholder : this.placeholder,
      helpText: serialized,
      position: overrides.position ?? this.position,
      width: overrides.width ?? this.width,
      colStart: 'colStart' in overrides ? overrides.colStart : this.colStart,
      rowStart: 'rowStart' in overrides ? overrides.rowStart : this.rowStart,
      rowSpan: nextRows,
      options: 'options' in overrides ? overrides.options : this.options,
    });
  }
}

function clampOptCol(c: number | null | undefined): number | null {
  if (c == null) return null;
  const n = Math.round(c);
  if (n < 1) return 1;
  if (n > 12) return 12;
  return n;
}

function clampOptRow(r: number | null | undefined): number | null {
  if (r == null) return null;
  const n = Math.round(r);
  if (n < 1) return 1;
  return n;
}

function clampWidth(w: number): FieldWidth {
  const n = Math.round(w);
  if (n < 1) return 1;
  if (n > 12) return 12;
  return n as FieldWidth;
}

function clampRows(r: number): number {
  const n = Math.round(r);
  if (n < 1) return 1;
  if (n > 6) return 6;
  return n;
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

export interface PageDef {
  id: PageId;
  label: string;
  index: number;
}

/**
 * Compute the list of pages that exist in a form, based on the field set.
 * Always includes 'p1'. Returns pages in the order they first appear in the
 * field list.
 */
export function listPages(fields: readonly FormField[]): PageDef[] {
  const seen: PageId[] = [];
  for (const f of fields) {
    if (!seen.includes(f.page)) seen.push(f.page);
  }
  if (seen.length === 0) seen.push(DEFAULT_PAGE);
  if (!seen.includes(DEFAULT_PAGE)) seen.unshift(DEFAULT_PAGE);
  return seen.map((id, index) => ({
    id,
    label: pageLabelFor(id, index),
    index,
  }));
}

export function pageLabelFor(id: PageId, index: number): string {
  // 'p1' → "Página 1", 'p2' → "Página 2"... or use trailing digits when present
  const m = id.match(/(\d+)$/);
  const n = m ? Number(m[1]) : index + 1;
  return `Página ${n}`;
}

export function nextPageId(existing: readonly PageId[]): PageId {
  let n = existing.length + 1;
  while (existing.includes(`p${n}`)) n++;
  return `p${n}`;
}

export const DEFAULT_PAGE_ID: PageId = DEFAULT_PAGE;
