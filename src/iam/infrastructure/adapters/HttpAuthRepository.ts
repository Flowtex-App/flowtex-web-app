import type { AxiosInstance } from 'axios';
import type {
  IAuthRepository,
  AuthSession,
  SignUpInput,
} from '../../domain/ports/IAuthRepository';
import type { Credentials } from '../../domain/models/Credentials';
import { User, type Role } from '../../domain/models/User';

interface AuthenticatedUserDto {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: Role[];
  token: string;
}

interface UserDto {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: Role[];
}

const toUser = (dto: UserDto | AuthenticatedUserDto): User =>
  new User({
    id: dto.id,
    username: dto.username,
    email: dto.email,
    fullName: dto.fullName,
    roles: dto.roles,
  });

export class HttpAuthRepository implements IAuthRepository {
  constructor(private readonly http: AxiosInstance) {}

  async signIn(credentials: Credentials): Promise<AuthSession> {
    const { data } = await this.http.post<AuthenticatedUserDto>(
      '/authentication/sign-in',
      {
        username: credentials.username,
        password: credentials.password,
      },
    );
    return { user: toUser(data), token: data.token };
  }

  async signUp(input: SignUpInput): Promise<void> {
    await this.http.post('/authentication/sign-up', {
      username: input.username,
      email: input.email,
      fullName: input.fullName,
      password: input.password,
    });
  }

  async signOut(): Promise<void> {
    return;
  }

  async fetchCurrentUser(): Promise<User> {
    const { data } = await this.http.get<UserDto>('/users/me');
    return toUser(data);
  }
}
