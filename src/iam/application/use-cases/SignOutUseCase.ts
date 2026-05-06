import type { IAuthRepository } from '../../domain/ports/IAuthRepository';
import type { ITokenStorage } from '../../domain/ports/ITokenStorage';

export class SignOutUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly tokenStorage: ITokenStorage,
  ) {}

  async execute(): Promise<void> {
    await this.authRepository.signOut();
    this.tokenStorage.clear();
  }
}
