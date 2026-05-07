import type { IAuthRepository, SignUpInput } from '../../domain/ports/IAuthRepository';

export class SignUpUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(input: SignUpInput): Promise<void> {
    if (!input.email.includes('@')) throw new Error('Email invalido');
    if (input.password.length < 8) throw new Error('La contrasena debe tener al menos 8 caracteres');
    if (!input.fullName.trim()) throw new Error('El nombre completo es obligatorio');
    if (!input.username.trim()) throw new Error('El usuario es obligatorio');
    await this.authRepository.signUp(input);
  }
}
