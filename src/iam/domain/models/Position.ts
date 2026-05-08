/**
 * Cargos disponibles en Claro Perú. El backend acepta el valor en mayúsculas
 * (PRACTICANTE, ANALISTA, ...) y el frontend muestra `label`.
 */
export type Position =
  | 'PRACTICANTE'
  | 'ANALISTA'
  | 'JEFE'
  | 'GERENTE'
  | 'SUBDIRECTOR'
  | 'DIRECTOR';

export const POSITIONS: { id: Position; label: string }[] = [
  { id: 'PRACTICANTE', label: 'Practicante' },
  { id: 'ANALISTA',    label: 'Analista' },
  { id: 'JEFE',        label: 'Jefe' },
  { id: 'GERENTE',     label: 'Gerente' },
  { id: 'SUBDIRECTOR', label: 'Subdirector' },
  { id: 'DIRECTOR',    label: 'Director' },
];

export const positionLabel = (id: Position | null | undefined): string =>
  POSITIONS.find((p) => p.id === id)?.label ?? '';
