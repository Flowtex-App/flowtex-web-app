/**
 * User aggregate (frontend representation).
 *
 * El frontend tiene su propia visión del dominio. No debe ser un mero espejo del
 * backend: aquí viven solo los invariantes y comportamientos que la UI necesita
 * para razonar sobre el usuario autenticado.
 */
export type UserRole = 'admin' | 'user';

export class User {
  readonly id: number;
  readonly username: string;
  readonly email: string;
  readonly role: UserRole;

  constructor(props: { id: number; username: string; email: string; role: UserRole }) {
    if (!props.username) throw new Error('username is required');
    if (!props.email) throw new Error('email is required');
    this.id = props.id;
    this.username = props.username;
    this.email = props.email;
    this.role = props.role;
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }
}
