export const FIELD_TYPES = [
  // Layout / display
  'HEADING',
  'PARAGRAPH',
  'SECTION',
  'DIVIDER',
  'SPACER',
  'IMAGE',

  // Auto-fill (presentational, resolved with current user metadata)
  'AUTO_USER_NAME',
  'AUTO_EMPLOYEE_CODE',
  'AUTO_POSITION',
  'AUTO_AREA',

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
  | 'AUTO'
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
    /** Auto-filled fields use current user metadata at render. */
    autoFill: boolean;
    defaultWidth: number;
  }
> = {
  HEADING:    { label: 'Encabezado',  glyph: 'H',  description: 'Título de sección',          group: 'LAYOUT',    supportsOptions: false, presentational: true,  autoFill: false, defaultWidth: 12 },
  PARAGRAPH:  { label: 'Párrafo',     glyph: '¶',  description: 'Bloque de instrucciones',    group: 'LAYOUT',    supportsOptions: false, presentational: true,  autoFill: false, defaultWidth: 12 },
  SECTION:    { label: 'Sección',     glyph: '§',  description: 'Banda divisoria con título', group: 'LAYOUT',    supportsOptions: false, presentational: true,  autoFill: false, defaultWidth: 12 },
  DIVIDER:    { label: 'Divisor',     glyph: '—',  description: 'Línea horizontal',           group: 'LAYOUT',    supportsOptions: false, presentational: true,  autoFill: false, defaultWidth: 12 },
  SPACER:     { label: 'Espaciador',  glyph: '◻',  description: 'Hueco vacío en el grid',     group: 'LAYOUT',    supportsOptions: false, presentational: true,  autoFill: false, defaultWidth: 4  },
  IMAGE:      { label: 'Imagen',      glyph: '🖼',  description: 'Imagen por URL o subida',    group: 'LAYOUT',    supportsOptions: false, presentational: true,  autoFill: false, defaultWidth: 6  },

  AUTO_USER_NAME:     { label: 'Nombre completo (auto)',    glyph: '👤', description: 'Se rellena con el nombre del usuario', group: 'AUTO', supportsOptions: false, presentational: false, autoFill: true, defaultWidth: 6 },
  AUTO_EMPLOYEE_CODE: { label: 'Código de empleado (auto)', glyph: 'C#', description: 'Se rellena con el código del usuario', group: 'AUTO', supportsOptions: false, presentational: false, autoFill: true, defaultWidth: 4 },
  AUTO_POSITION:      { label: 'Cargo (auto)',              glyph: '⚐',  description: 'Cargo + especialidad del usuario',     group: 'AUTO', supportsOptions: false, presentational: false, autoFill: true, defaultWidth: 6 },
  AUTO_AREA:          { label: 'Área (auto)',               glyph: '⌂',  description: 'Área organizacional del usuario',      group: 'AUTO', supportsOptions: false, presentational: false, autoFill: true, defaultWidth: 6 },

  TEXT:         { label: 'Texto corto',    glyph: 'Aa', description: 'Una línea',                   group: 'TEXTO',     supportsOptions: false, presentational: false, autoFill: false, defaultWidth: 6  },
  TEXTAREA:     { label: 'Texto largo',    glyph: '¶a', description: 'Párrafo multilínea',          group: 'TEXTO',     supportsOptions: false, presentational: false, autoFill: false, defaultWidth: 12 },
  EMAIL:        { label: 'Email',          glyph: '@',  description: 'Correo validado',             group: 'TEXTO',     supportsOptions: false, presentational: false, autoFill: false, defaultWidth: 6  },
  PHONE:        { label: 'Teléfono',       glyph: '☎',  description: 'Número de teléfono',          group: 'TEXTO',     supportsOptions: false, presentational: false, autoFill: false, defaultWidth: 4  },
  URL:          { label: 'URL',            glyph: '↗',  description: 'Enlace web',                  group: 'TEXTO',     supportsOptions: false, presentational: false, autoFill: false, defaultWidth: 6  },

  NUMBER:       { label: 'Número',         glyph: '#',  description: 'Entero o decimal',            group: 'NUMERICO',  supportsOptions: false, presentational: false, autoFill: false, defaultWidth: 4  },

  SELECT:       { label: 'Lista (uno)',    glyph: '▾',  description: 'Combo desplegable',           group: 'SELECCION', supportsOptions: true,  presentational: false, autoFill: false, defaultWidth: 6  },
  MULTI_SELECT: { label: 'Lista (varios)', glyph: '☰',  description: 'Multi-selección',             group: 'SELECCION', supportsOptions: true,  presentational: false, autoFill: false, defaultWidth: 6  },
  RADIO:        { label: 'Opción única',   glyph: '◉',  description: 'Botones de opción',           group: 'SELECCION', supportsOptions: true,  presentational: false, autoFill: false, defaultWidth: 6  },
  CHECKBOX:     { label: 'Confirmación',   glyph: '☑',  description: 'Booleano',                    group: 'SELECCION', supportsOptions: false, presentational: false, autoFill: false, defaultWidth: 12 },

  DATE:         { label: 'Fecha',          glyph: '📅', description: 'Solo día',                    group: 'TIEMPO',    supportsOptions: false, presentational: false, autoFill: false, defaultWidth: 4 },
  DATETIME:     { label: 'Fecha + hora',   glyph: '⏱',  description: 'Día y hora',                  group: 'TIEMPO',    supportsOptions: false, presentational: false, autoFill: false, defaultWidth: 6 },

  FILE:         { label: 'Adjunto',        glyph: '📎', description: 'Subida de archivo',           group: 'AVANZADO',  supportsOptions: false, presentational: false, autoFill: false, defaultWidth: 12 },
  SIGNATURE:    { label: 'Firma',          glyph: '✎',  description: 'Firma digital',               group: 'AVANZADO',  supportsOptions: false, presentational: false, autoFill: false, defaultWidth: 12 },
};

export interface FieldGroupMeta {
  id: FieldGroup;
  label: string;
  hint: string;
}

export const FIELD_GROUPS: FieldGroupMeta[] = [
  { id: 'LAYOUT',    label: 'Estructura',    hint: 'Encabezados y separadores' },
  { id: 'AUTO',      label: 'Auto del usuario', hint: 'Se rellenan con datos del empleado' },
  { id: 'TEXTO',     label: 'Texto',         hint: 'Entradas alfanuméricas' },
  { id: 'NUMERICO',  label: 'Numérico',      hint: 'Cantidades y montos' },
  { id: 'SELECCION', label: 'Selección',     hint: 'Opciones cerradas' },
  { id: 'TIEMPO',    label: 'Fecha y hora',  hint: 'Calendarios' },
  { id: 'AVANZADO',  label: 'Avanzado',      hint: 'Archivos y firma' },
];

export const isPresentational = (type: FieldType): boolean =>
  FIELD_TYPE_META[type].presentational;

export const isAutoFill = (type: FieldType): boolean =>
  FIELD_TYPE_META[type].autoFill;
