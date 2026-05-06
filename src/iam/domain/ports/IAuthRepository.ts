import type { User } from '../models/User';
import type { Credentials } from '../models/Credentials';

/**
 * Port (interface) que define cómo el dominio espera interactuar con
 * cualquier mecanismo de autenticación. La implementación concreta
 * (HTTP, mock, fixture, etc.) vive en `infrastructure/adapters/`.
 *
 * El dominio NO conoce detalles de transporte. Solo conoce este contrato.
 */
export interface AuthSession {
  user: User;
  token: string;
}

export interface IAuthRepository {
  signIn(credentials: Credentials): Promise<AuthSession>;
  signUp(input: { username: string; email: string; password: string }): Promise<void>;
  signOut(): Promise<void>;
}
