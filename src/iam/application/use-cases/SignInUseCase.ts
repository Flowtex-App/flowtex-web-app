import { Credentials } from '../../domain/models/Credentials';
import type { User } from '../../domain/models/User';
import type { IAuthRepository } from '../../domain/ports/IAuthRepository';
import type { ITokenStorage } from '../../domain/ports/ITokenStorage';

/**
 * Caso de uso: iniciar sesión.
 *
 * Orquesta dominio + ports. No contiene reglas de negocio del aggregate
 * (esas viven en `domain/`). Tampoco contiene detalles de transporte
 * (esos viven en `infrastructure/`).
 */
export class SignInUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly tokenStorage: ITokenStorage,
  ) {}

  async execute(input: { username: string; password: string }): Promise<User> {
    const credentials = new Credentials(input.username, input.password);
    const session = await this.authRepository.signIn(credentials);
    this.tokenStorage.save(session.token);
    return session.user;
  }
}
