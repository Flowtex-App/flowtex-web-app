export const FIELD_TYPES = [
  // Layout / display
  'HEADING',
  'PARAGRAPH',
  'SECTION',
  'DIVIDER',

  // Text inputs
  'TEXT',
  'TEXTAREA',
  'EMAIL',
  'PHONE',
  'URL',
  'NUMBER',

  // Choice
  'SELECT',
  'MULTI_SELECT',
  'RADIO',
  'CHECKBOX',

  // Date / advanced
  'DATE',
  'DATETIME',
  'FILE',
  'SIGNATURE',
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export type FieldGroup =
  | 'LAYOUT'
  | 'TEXTO'
  | 'NUMERICO'
  | 'SELECCION'
  | 'TIEMPO'
  | 'AVANZADO';

export const FIELD_TYPE_META: Record<
  FieldType,
  {
    label: string;
    glyph: string;
    description: string;
    group: FieldGroup;
    supportsOptions: boolean;
    /** Layout-only types capture no input data and skip the value-binding UI. */
    presentational: boolean;
    defaultWidth: number;
  }
> = {
  HEADING:      { label: 'Encabezado',     glyph: 'H',  description: 'Titulo de seccion',           group: 'LAYOUT',    supportsOptions: false, presentational: true,  defaultWidth: 12 },
  PARAGRAPH:    { label: 'Parrafo',        glyph: '¶',  description: 'Bloque de instrucciones',     group: 'LAYOUT',    supportsOptions: false, presentational: true,  defaultWidth: 12 },
  SECTION:      { label: 'Seccion',        glyph: '§',  description: 'Banda divisoria con titulo',  group: 'LAYOUT',    supportsOptions: false, presentational: true,  defaultWidth: 12 },
  DIVIDER:      { label: 'Divisor',        glyph: '—',  description: 'Linea horizontal',            group: 'LAYOUT',    supportsOptions: false, presentational: true,  defaultWidth: 12 },

  TEXT:         { label: 'Texto corto',    glyph: 'Aa', description: 'Una linea',                   group: 'TEXTO',     supportsOptions: false, presentational: false, defaultWidth: 6 },
  TEXTAREA:     { label: 'Texto largo',    glyph: '¶a', description: 'Parrafo multilinea',          group: 'TEXTO',     supportsOptions: false, presentational: false, defaultWidth: 12 },
  EMAIL:        { label: 'Email',          glyph: '@',  description: 'Correo validado',             group: 'TEXTO',     supportsOptions: false, presentational: false, defaultWidth: 6 },
  PHONE:        { label: 'Telefono',       glyph: '☎',  description: 'Numero de telefono',          group: 'TEXTO',     supportsOptions: false, presentational: false, defaultWidth: 4 },
  URL:          { label: 'URL',            glyph: '↗',  description: 'Enlace web',                  group: 'TEXTO',     supportsOptions: false, presentational: false, defaultWidth: 6 },

  NUMBER:       { label: 'Numero',         glyph: '#',  description: 'Entero o decimal',            group: 'NUMERICO',  supportsOptions: false, presentational: false, defaultWidth: 4 },

  SELECT:       { label: 'Lista (uno)',    glyph: '▾',  description: 'Combo desplegable',           group: 'SELECCION', supportsOptions: true,  presentational: false, defaultWidth: 6 },
  MULTI_SELECT: { label: 'Lista (varios)', glyph: '☰',  description: 'Multi-seleccion',             group: 'SELECCION', supportsOptions: true,  presentational: false, defaultWidth: 6 },
  RADIO:        { label: 'Opcion unica',   glyph: '◉',  description: 'Botones de opcion',           group: 'SELECCION', supportsOptions: true,  presentational: false, defaultWidth: 6 },
  CHECKBOX:     { label: 'Confirmacion',   glyph: '☑',  description: 'Booleano',                    group: 'SELECCION', supportsOptions: false, presentational: false, defaultWidth: 12 },

  DATE:         { label: 'Fecha',          glyph: '📅', description: 'Solo dia',                    group: 'TIEMPO',    supportsOptions: false, presentational: false, defaultWidth: 4 },
  DATETIME:     { label: 'Fecha + hora',   glyph: '⏱',  description: 'Dia y hora',                  group: 'TIEMPO',    supportsOptions: false, presentational: false, defaultWidth: 6 },

  FILE:         { label: 'Adjunto',        glyph: '📎', description: 'Subida de archivo',           group: 'AVANZADO',  supportsOptions: false, presentational: false, defaultWidth: 12 },
  SIGNATURE:    { label: 'Firma',          glyph: '✎',  description: 'Firma digital',               group: 'AVANZADO',  supportsOptions: false, presentational: false, defaultWidth: 12 },
};

export interface FieldGroupMeta {
  id: FieldGroup;
  label: string;
  hint: string;
}

export const FIELD_GROUPS: FieldGroupMeta[] = [
  { id: 'LAYOUT',    label: 'Estructura',    hint: 'Encabezados y separadores' },
  { id: 'TEXTO',     label: 'Texto',         hint: 'Entradas alfanumericas' },
  { id: 'NUMERICO',  label: 'Numerico',      hint: 'Cantidades y montos' },
  { id: 'SELECCION', label: 'Seleccion',     hint: 'Opciones cerradas' },
  { id: 'TIEMPO',    label: 'Fecha y hora',  hint: 'Calendarios' },
  { id: 'AVANZADO',  label: 'Avanzado',      hint: 'Archivos y firma' },
];

export const isPresentational = (type: FieldType): boolean =>
  FIELD_TYPE_META[type].presentational;
