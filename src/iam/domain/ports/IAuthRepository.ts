import type { User } from '../models/User';
import type { Credentials } from '../models/Credentials';

export interface AuthSession {
  user: User;
  token: string;
}

export interface SignUpInput {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

export interface IAuthRepository {
  signIn(credentials: Credentials): Promise<AuthSession>;
  signUp(input: SignUpInput): Promise<void>;
  signOut(): Promise<void>;
  fetchCurrentUser(): Promise<User>;
}
