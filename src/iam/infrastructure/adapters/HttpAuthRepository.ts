import type { AxiosInstance } from 'axios';
import type { IAuthRepository, AuthSession } from '../../domain/ports/IAuthRepository';
import type { Credentials } from '../../domain/models/Credentials';
import { User } from '../../domain/models/User';

/**
 * Adapter HTTP del repositorio de autenticación.
 *
 * Implementa el port `IAuthRepository` usando axios. Es el ÚNICO lugar
 * que conoce la forma del API REST del backend (rutas, payloads, mapeos).
 *
 * Si el backend cambia (ej. de REST a GraphQL), se reemplaza este adapter
 * sin tocar `domain/` ni `application/`.
 */
type SignInResponseDto = {
  id: number;
  username: string;
  token: string;
};

type UserDto = {
  id: number;
  username: string;
  email: string;
  roleId: number;
};

const mapRole = (roleId: number): 'admin' | 'user' => (roleId === 1 ? 'admin' : 'user');

export class HttpAuthRepository implements IAuthRepository {
  constructor(private readonly http: AxiosInstance) {}

  async signIn(credentials: Credentials): Promise<AuthSession> {
    const { data } = await this.http.post<SignInResponseDto>('/authentication/sign-in', {
      username: credentials.username,
      password: credentials.password,
    });

    // El sign-in del backend no devuelve email/role en este contrato.
    // Se hace un fetch posterior, o se ajusta el contrato. Por ahora, asumimos role=user.
    const user = new User({
      id: data.id,
      username: data.username,
      email: '',
      role: 'user',
    });
    return { user, token: data.token };
  }

  async signUp(input: { username: string; email: string; password: string }): Promise<void> {
    await this.http.post('/authentication/sign-up', input);
  }

  async signOut(): Promise<void> {
    // El backend en este contrato no requiere endpoint de sign-out (token JWT stateless).
    // Si en el futuro hay un endpoint de revocación, va acá.
    return;
  }

  async fetchCurrentUser(userId: number): Promise<User> {
    const { data } = await this.http.get<UserDto>(`/users/${userId}`);
    return new User({
      id: data.id,
      username: data.username,
      email: data.email,
      role: mapRole(data.roleId),
    });
  }
}
