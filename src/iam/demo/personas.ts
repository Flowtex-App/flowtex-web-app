import type { Role } from '../domain/models/User';

/**
 * Registro de personas para el MODO DEMO.
 *
 * La app entra directo (sin login) y ofrece un selector "Actuar como" para
 * saltar entre las personas involucradas en el recorrido de aprobacion.
 * Todas las personas son usuarios sembrados por Flyway (V2) que comparten
 * la misma contrasena de demo. "Actuar como X" inicia sesion por debajo como
 * ese usuario, por lo que cada llamada sigue llevando un JWT real.
 */

export const DEMO_PASSWORD = 'Flowtex2026!';

export interface DemoPersona {
  key: string;
  /** id sembrado en Flyway V2 (para resolver asignaciones por usuario). */
  id: number;
  label: string;
  username: string;
  roles: Role[];
  roleLabel: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  { key: 'demo',   id: 6, label: 'Demo (todos los roles)', username: 'demo',   roles: ['ROLE_ADMIN', 'ROLE_DESIGNER', 'ROLE_APPROVER', 'ROLE_USER'], roleLabel: 'Admin · Diseñador · Aprobador · Solicitante' },
  { key: 'gmora',  id: 1, label: 'Gabriel Mora',           username: 'gmora',  roles: ['ROLE_ADMIN', 'ROLE_DESIGNER'], roleLabel: 'Admin · Diseñador' },
  { key: 'clecca', id: 3, label: 'Christopher Lecca',      username: 'clecca', roles: ['ROLE_ADMIN', 'ROLE_DESIGNER'], roleLabel: 'Admin · Diseñador' },
  { key: 'mtongo', id: 2, label: 'Milagros Tongo',         username: 'mtongo', roles: ['ROLE_DESIGNER', 'ROLE_APPROVER'], roleLabel: 'Aprobador' },
  { key: 'mames',  id: 4, label: 'Mariano Ames',           username: 'mames',  roles: ['ROLE_USER'], roleLabel: 'Solicitante' },
  { key: 'asosa',  id: 5, label: 'Angello Sosa',           username: 'asosa',  roles: ['ROLE_USER'], roleLabel: 'Solicitante' },
  { key: 'aquispe',  id: 7,  label: 'Ana Quispe',     username: 'aquispe',  roles: ['ROLE_APPROVER', 'ROLE_USER'], roleLabel: 'Aprobador · Finanzas' },
  { key: 'lvargas',  id: 8,  label: 'Luis Vargas',    username: 'lvargas',  roles: ['ROLE_APPROVER'], roleLabel: 'Aprobador · Finanzas (Gerente)' },
  { key: 'rflores',  id: 9,  label: 'Rosa Flores',    username: 'rflores',  roles: ['ROLE_APPROVER', 'ROLE_USER'], roleLabel: 'Aprobador · RR.HH.' },
  { key: 'pramos',   id: 10, label: 'Pedro Ramos',    username: 'pramos',   roles: ['ROLE_USER'], roleLabel: 'Solicitante · Legal' },
  { key: 'cnunez',   id: 11, label: 'Carla Nunez',    username: 'cnunez',   roles: ['ROLE_APPROVER'], roleLabel: 'Aprobador · Legal (Gerente)' },
  { key: 'jsalazar', id: 12, label: 'Jorge Salazar',  username: 'jsalazar', roles: ['ROLE_APPROVER'], roleLabel: 'Aprobador · Operaciones' },
  { key: 'mcastro',  id: 13, label: 'Maria Castro',   username: 'mcastro',  roles: ['ROLE_APPROVER'], roleLabel: 'Aprobador · Mercado Corp.' },
  { key: 'dtorres',  id: 14, label: 'Diego Torres',   username: 'dtorres',  roles: ['ROLE_APPROVER', 'ROLE_DESIGNER'], roleLabel: 'Aprobador · Diseñador · Tecnología' },
  { key: 'smendoza', id: 15, label: 'Sofia Mendoza',  username: 'smendoza', roles: ['ROLE_USER'], roleLabel: 'Solicitante · Compras' },
  { key: 'erios',    id: 16, label: 'Elena Rios',     username: 'erios',    roles: ['ROLE_APPROVER', 'ROLE_ADMIN'], roleLabel: 'Admin · Aprobador · Auditoría' },
];

/** Persona con la que arranca la app. `demo` tiene los 4 roles. */
export const DEFAULT_PERSONA = DEMO_PERSONAS[0];

/** Forma mínima de un step execution para decidir quién puede actuar. */
export interface StepAssignmentLike {
  assignmentKind: string;
  assignedUserId: number | null;
  assignedRole: string | null;
  assignedArea?: string | null;
  assignedPosition?: string | null;
}

/**
 * Devuelve una persona demo capaz de actuar sobre el paso asignado, distinta de
 * la persona actual (para que el botón "Actuar como" nunca te apunte a ti mismo).
 * - USER: la persona con ese id.
 * - ROLE: una persona con ese rol.
 * - fallback: un aprobador (rol APPROVER), nunca la persona actual si se puede evitar.
 */
export function personaForStep(
  exec: StepAssignmentLike,
  excludeUsername?: string,
): DemoPersona | null {
  const pool = DEMO_PERSONAS.filter((p) => p.username !== excludeUsername);
  const approverFallback =
    pool.find((p) => p.roles.includes('ROLE_APPROVER')) ?? pool[0] ?? null;

  if (exec.assignmentKind === 'USER' && exec.assignedUserId != null) {
    return pool.find((p) => p.id === exec.assignedUserId) ?? approverFallback;
  }
  if (exec.assignmentKind === 'ROLE' && exec.assignedRole) {
    const role = exec.assignedRole as Role;
    return pool.find((p) => p.roles.includes(role)) ?? approverFallback;
  }
  return approverFallback;
}
