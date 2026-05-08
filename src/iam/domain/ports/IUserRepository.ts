import type { User, Role } from '../models/User';
import type { Area } from '../models/Area';
import type { Position } from '../models/Position';

export interface UserSearchFilter {
  q?: string;
  area?: Area;
  position?: Position;
}

export interface IUserRepository {
  list(filter?: UserSearchFilter): Promise<User[]>;
  getById(id: number): Promise<User>;
  updateRoles(id: number, roles: Role[]): Promise<User>;
}
