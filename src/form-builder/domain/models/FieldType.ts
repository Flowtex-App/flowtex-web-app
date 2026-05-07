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

export type FieldGroup = 'BASICOS' | 'SELECCION' | 'AVANZADOS';

export const FIELD_TYPE_META: Record<FieldType, {
  label: string;
  glyph: string;
  description: string;
  group: FieldGroup;
  supportsOptions: boolean;
}> = {
  TEXT:         { label: 'Texto corto',     glyph: 'Aa',  description: 'Una linea de texto',           group: 'BASICOS',   supportsOptions: false },
  TEXTAREA:     { label: 'Texto largo',     glyph: '¶',   description: 'Parrafo multilinea',           group: 'BASICOS',   supportsOptions: false },
  NUMBER:       { label: 'Numero',          glyph: '#',   description: 'Entero o decimal',             group: 'BASICOS',   supportsOptions: false },
  EMAIL:        { label: 'Email',           glyph: '@',   description: 'Correo electronico validado',  group: 'BASICOS',   supportsOptions: false },
  PHONE:        { label: 'Telefono',        glyph: '☎',   description: 'Numero de telefono',           group: 'BASICOS',   supportsOptions: false },
  URL:          { label: 'URL',             glyph: '↗',   description: 'Enlace web',                   group: 'BASICOS',   supportsOptions: false },

  SELECT:       { label: 'Lista (uno)',     glyph: '▾',   description: 'Combo desplegable',            group: 'SELECCION', supportsOptions: true },
  MULTI_SELECT: { label: 'Lista (varios)',  glyph: '☰',   description: 'Multi-seleccion',              group: 'SELECCION', supportsOptions: true },
  RADIO:        { label: 'Opcion unica',    glyph: '◉',   description: 'Botones de opcion',            group: 'SELECCION', supportsOptions: true },
  CHECKBOX:     { label: 'Checkbox',        glyph: '☑',   description: 'Confirmacion booleana',        group: 'SELECCION', supportsOptions: false },

  DATE:         { label: 'Fecha',           glyph: '📅',  description: 'Solo dia',                     group: 'AVANZADOS', supportsOptions: false },
  DATETIME:     { label: 'Fecha + hora',    glyph: '⏱',   description: 'Dia y hora',                   group: 'AVANZADOS', supportsOptions: false },
  FILE:         { label: 'Adjunto',         glyph: '📎',  description: 'Subida de archivo',            group: 'AVANZADOS', supportsOptions: false },
  SIGNATURE:    { label: 'Firma',           glyph: '✎',   description: 'Firma digital',                group: 'AVANZADOS', supportsOptions: false },
};

export const FIELD_GROUPS: { id: FieldGroup; label: string }[] = [
  { id: 'BASICOS',   label: 'Campos basicos' },
  { id: 'SELECCION', label: 'Seleccion' },
  { id: 'AVANZADOS', label: 'Avanzados' },
];
