import type { AxiosInstance } from 'axios';
import type {
  IAuthRepository,
  AuthSession,
  SignUpInput,
} from '../../domain/ports/IAuthRepository';
import type { Credentials } from '../../domain/models/Credentials';
import { User, type Role } from '../../domain/models/User';
import type { Area } from '../../domain/models/Area';
import type { Position } from '../../domain/models/Position';

interface AuthenticatedUserDto {
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
  token: string;
}

interface UserDto {
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
}

const toUser = (dto: UserDto | AuthenticatedUserDto): User =>
  new User({
    id: dto.id,
    username: dto.username,
    email: dto.email,
    fullName: dto.fullName,
    employeeCode: dto.employeeCode ?? '',
    position: dto.position ?? null,
    positionLabel: dto.positionLabel ?? null,
    positionSpecialty: dto.positionSpecialty ?? null,
    area: dto.area ?? null,
    areaLabel: dto.areaLabel ?? null,
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
      employeeCode: input.employeeCode,
      position: input.position,
      positionSpecialty: input.positionSpecialty ?? null,
      area: input.area,
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
