export const FIELD_TYPES = [
  'TEXT',
  'TEXTAREA',
  'NUMBER',
  'EMAIL',
  'DATE',
  'DATETIME',
  'SELECT',
  'MULTI_SELECT',
  'RADIO',
  'CHECKBOX',
  'FILE',
  'URL',
  'PHONE',
  'SIGNATURE',
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export const FIELD_TYPE_META: Record<FieldType, { label: string; emoji: string; supportsOptions: boolean }> = {
  TEXT:         { label: 'Texto corto',     emoji: 'Aa',  supportsOptions: false },
  TEXTAREA:     { label: 'Texto largo',     emoji: '¶',   supportsOptions: false },
  NUMBER:       { label: 'Numero',          emoji: '#',   supportsOptions: false },
  EMAIL:        { label: 'Email',           emoji: '@',   supportsOptions: false },
  DATE:         { label: 'Fecha',           emoji: '📅', supportsOptions: false },
  DATETIME:     { label: 'Fecha y hora',    emoji: '🕒', supportsOptions: false },
  SELECT:       { label: 'Lista (uno)',     emoji: '▾',   supportsOptions: true },
  MULTI_SELECT: { label: 'Lista (varios)',  emoji: '☰',   supportsOptions: true },
  RADIO:        { label: 'Opcion unica',    emoji: '⊙',   supportsOptions: true },
  CHECKBOX:     { label: 'Checkbox',        emoji: '☑',   supportsOptions: false },
  FILE:         { label: 'Adjunto',         emoji: '📎', supportsOptions: false },
  URL:          { label: 'URL',             emoji: '🔗', supportsOptions: false },
  PHONE:        { label: 'Telefono',        emoji: '📞', supportsOptions: false },
  SIGNATURE:    { label: 'Firma',           emoji: '✍',   supportsOptions: false },
};
