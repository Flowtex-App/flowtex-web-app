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
 * Devuelve una persona demo capaz de actuar sobre el paso asignado.
 * - USER: la persona con ese id.
 * - ROLE: una persona con ese rol (prefiere una específica antes que la Demo comodín).
 * - fallback: la persona Demo (tiene todos los roles).
 */
export function personaForStep(exec: StepAssignmentLike): DemoPersona | null {
  const demo = DEMO_PERSONAS.find((p) => p.key === 'demo') ?? null;
  if (exec.assignmentKind === 'USER' && exec.assignedUserId != null) {
    return DEMO_PERSONAS.find((p) => p.id === exec.assignedUserId) ?? demo;
  }
  if (exec.assignmentKind === 'ROLE' && exec.assignedRole) {
    const role = exec.assignedRole as Role;
    return (
      DEMO_PERSONAS.find((p) => p.key !== 'demo' && p.roles.includes(role)) ??
      DEMO_PERSONAS.find((p) => p.roles.includes(role)) ??
      demo
    );
  }
  return demo;
}
