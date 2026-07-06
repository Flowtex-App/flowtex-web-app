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
  label: string;
  username: string;
  roleLabel: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  { key: 'demo',   label: 'Demo (todos los roles)', username: 'demo',   roleLabel: 'Admin · Diseñador · Aprobador · Solicitante' },
  { key: 'gmora',  label: 'Gabriel Mora',           username: 'gmora',  roleLabel: 'Admin · Diseñador' },
  { key: 'clecca', label: 'Christopher Lecca',      username: 'clecca', roleLabel: 'Admin · Diseñador' },
  { key: 'mtongo', label: 'Milagros Tongo',         username: 'mtongo', roleLabel: 'Aprobador' },
  { key: 'mames',  label: 'Mariano Ames',           username: 'mames',  roleLabel: 'Solicitante' },
  { key: 'asosa',  label: 'Angello Sosa',           username: 'asosa',  roleLabel: 'Solicitante' },
];

/** Persona con la que arranca la app. `demo` tiene los 4 roles. */
export const DEFAULT_PERSONA = DEMO_PERSONAS[0];
