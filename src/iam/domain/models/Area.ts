/**
 * Áreas organizacionales de Claro Perú. El backend acepta el valor en
 * mayúsculas (TECNOLOGIA, FINANZAS, ...) y el frontend muestra `label`.
 */
export type Area =
  | 'TECNOLOGIA'
  | 'FINANZAS'
  | 'MERCADO_CORPORATIVO'
  | 'RECURSOS_HUMANOS'
  | 'LEGAL'
  | 'OPERACIONES'
  | 'COMERCIAL_MASIVO'
  | 'MARKETING'
  | 'ATENCION_CLIENTE'
  | 'COMPRAS'
  | 'AUDITORIA';

export const AREAS: { id: Area; label: string }[] = [
  { id: 'TECNOLOGIA',          label: 'Tecnología' },
  { id: 'FINANZAS',            label: 'Finanzas' },
  { id: 'MERCADO_CORPORATIVO', label: 'Mercado Corporativo' },
  { id: 'RECURSOS_HUMANOS',    label: 'Recursos Humanos' },
  { id: 'LEGAL',               label: 'Legal' },
  { id: 'OPERACIONES',         label: 'Operaciones' },
  { id: 'COMERCIAL_MASIVO',    label: 'Comercial Masivo' },
  { id: 'MARKETING',           label: 'Marketing' },
  { id: 'ATENCION_CLIENTE',    label: 'Atención al Cliente' },
  { id: 'COMPRAS',             label: 'Compras' },
  { id: 'AUDITORIA',           label: 'Auditoría' },
];

export const areaLabel = (id: Area | null | undefined): string =>
  AREAS.find((a) => a.id === id)?.label ?? '';

export const EMPLOYEE_CODE_PATTERN = /^C\d{5}$/;
