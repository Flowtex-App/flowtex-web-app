import type { Area } from './Area';
import type { Position } from './Position';

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
  readonly employeeCode: string;
  readonly position: Position | null;
  readonly positionLabel: string | null;
  readonly positionSpecialty: string | null;
  readonly area: Area | null;
  readonly areaLabel: string | null;
  readonly roles: readonly Role[];

  constructor(props: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    employeeCode?: string | null;
    position?: Position | null;
    positionLabel?: string | null;
    positionSpecialty?: string | null;
    area?: Area | null;
    areaLabel?: string | null;
    roles: Role[];
  }) {
    if (!props.username) throw new Error('username is required');
    if (!props.fullName) throw new Error('fullName is required');
    this.id = props.id;
    this.username = props.username;
    this.email = props.email;
    this.fullName = props.fullName;
    this.employeeCode = props.employeeCode ?? '';
    this.position = props.position ?? null;
    this.positionLabel = props.positionLabel ?? null;
    this.positionSpecialty = props.positionSpecialty ?? null;
    this.area = props.area ?? null;
    this.areaLabel = props.areaLabel ?? null;
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

  /** "Analista de Sistemas" — combina cargo + especialidad. */
  formattedPosition(): string {
    const base = this.positionLabel ?? '';
    if (this.positionSpecialty) return `${base} ${this.positionSpecialty}`.trim();
    return base;
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
