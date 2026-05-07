/**
 * User aggregate del frontend.
 *
 * Representa al usuario autenticado en la sesión actual. Cero invariantes de
 * persistencia: solo lo que la UI necesita para razonar sobre permisos
 * y presentación.
 */
export type Role =
  | 'ROLE_ADMIN'
  | 'ROLE_DESIGNER'
  | 'ROLE_APPROVER'
  | 'ROLE_USER';

export class User {
  readonly id: number;
  readonly username: string;
  readonly email: string;
  readonly fullName: string;
  readonly roles: readonly Role[];

  constructor(props: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    roles: Role[];
  }) {
    if (!props.username) throw new Error('username is required');
    if (!props.fullName) throw new Error('fullName is required');
    this.id = props.id;
    this.username = props.username;
    this.email = props.email;
    this.fullName = props.fullName;
    this.roles = Object.freeze([...props.roles]);
  }

  hasRole(role: Role): boolean {
    return this.roles.includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  isDesigner(): boolean {
    return this.hasRole('ROLE_DESIGNER') || this.isAdmin();
  }

  initials(): string {
    return this.fullName
      .split(' ')
      .map((part) => part[0]?.toUpperCase())
      .filter(Boolean)
      .slice(0, 2)
      .join('');
  }
}
