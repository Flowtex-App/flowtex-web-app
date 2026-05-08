import type { User } from '../models/User';
import type { Credentials } from '../models/Credentials';
import type { Area } from '../models/Area';
import type { Position } from '../models/Position';

export interface AuthSession {
  user: User;
  token: string;
}

export interface SignUpInput {
  username: string;
  email: string;
  fullName: string;
  password: string;
  employeeCode: string;
  position: Position;
  positionSpecialty?: string;
  area: Area;
}

export interface IAuthRepository {
  signIn(credentials: Credentials): Promise<AuthSession>;
  signUp(input: SignUpInput): Promise<void>;
  signOut(): Promise<void>;
  fetchCurrentUser(): Promise<User>;
}
