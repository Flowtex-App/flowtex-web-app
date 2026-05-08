import type { AxiosInstance } from 'axios';
import { User, type Role } from '../../domain/models/User';
import type { Area } from '../../domain/models/Area';
import type { Position } from '../../domain/models/Position';
import type { IUserRepository, UserSearchFilter } from '../../domain/ports/IUserRepository';

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

const toUser = (dto: UserDto): User =>
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

export class HttpUserRepository implements IUserRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(filter?: UserSearchFilter): Promise<User[]> {
    const params: Record<string, string> = {};
    if (filter?.q) params.q = filter.q;
    if (filter?.area) params.area = filter.area;
    if (filter?.position) params.position = filter.position;
    const { data } = await this.http.get<UserDto[]>('/users', { params });
    return data.map(toUser);
  }

  async getById(id: number): Promise<User> {
    const { data } = await this.http.get<UserDto>(`/users/${id}`);
    return toUser(data);
  }

  async updateRoles(id: number, roles: Role[]): Promise<User> {
    const { data } = await this.http.put<UserDto>(`/users/${id}/roles`, { roles });
    return toUser(data);
  }
}
