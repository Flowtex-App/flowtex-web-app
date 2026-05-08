/**
 * Información del formulario que el editor de workflow necesita para ofrecer
 * autocompletado de fieldKeys, operators y values en condiciones CUSTOM.
 *
 * Lo provee el FormBuilder cuando monta el WorkflowEditor en su pestaña
 * "Aprobaciones". Cuando el editor se monta sin contexto, el modal cae al
 * textarea de JSON crudo (modo legacy).
 */
export interface FormContextField {
  fieldKey: string;
  label: string;
  fieldType: string;
  /** Solo presente para SELECT, MULTI_SELECT y RADIO. */
  options?: string[];
}

export interface FormContext {
  fields: FormContextField[];
}

/** Tipos cuyo valor es libre y se compara como texto. */
export const TEXTUAL_TYPES = new Set([
  'TEXT', 'TEXTAREA', 'EMAIL', 'URL', 'PHONE', 'SIGNATURE',
]);

/** Tipos numéricos / con orden. */
export const NUMERIC_TYPES = new Set([
  'NUMBER', 'DATE', 'DATETIME',
]);

/** Tipos con opciones cerradas. El builder muestra dropdown de sus options. */
export const CHOICE_TYPES = new Set([
  'SELECT', 'MULTI_SELECT', 'RADIO',
]);

/** Tipos presentational / auto-fill / spacers que no tienen valor a comparar. */
export const NON_VALUE_TYPES = new Set([
  'HEADING', 'PARAGRAPH', 'SECTION', 'DIVIDER', 'SPACER',
]);

export interface CustomCondition {
  field: string;
  operator: string;
  value: string | number | boolean;
}

export const OPERATORS = [
  { id: 'EQUALS',     label: 'es igual a',     applies: 'all' as const },
  { id: 'NOT_EQUALS', label: 'no es igual a',  applies: 'all' as const },
  { id: 'CONTAINS',   label: 'contiene',       applies: 'text' as const },
  { id: 'GT',         label: 'mayor que (>)',  applies: 'number' as const },
  { id: 'LT',         label: 'menor que (<)',  applies: 'number' as const },
  { id: 'GTE',        label: 'mayor o igual a (≥)', applies: 'number' as const },
  { id: 'LTE',        label: 'menor o igual a (≤)', applies: 'number' as const },
] as const;

export type OperatorId = (typeof OPERATORS)[number]['id'];

export function operatorsForField(fieldType: string | undefined): typeof OPERATORS[number][] {
  if (!fieldType) return OPERATORS.slice();
  if (NUMERIC_TYPES.has(fieldType)) return OPERATORS.filter((o) => o.applies !== 'text');
  if (CHOICE_TYPES.has(fieldType)) return OPERATORS.filter((o) => o.applies !== 'number');
  if (TEXTUAL_TYPES.has(fieldType)) return OPERATORS.filter((o) => o.applies !== 'number');
  return OPERATORS.slice();
}
