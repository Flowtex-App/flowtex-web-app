import type { IAuthRepository } from '../../domain/ports/IAuthRepository';

export class SignUpUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(input: { username: string; email: string; password: string }): Promise<void> {
    if (!input.email.includes('@')) throw new Error('Invalid email');
    if (input.password.length < 8) throw new Error('Password must be at least 8 characters');
    await this.authRepository.signUp(input);
  }
}
