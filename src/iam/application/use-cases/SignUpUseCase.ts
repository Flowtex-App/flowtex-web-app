import type { IAuthRepository, SignUpInput } from '../../domain/ports/IAuthRepository';
import { EMPLOYEE_CODE_PATTERN } from '../../domain/models/Area';

export class SignUpUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(input: SignUpInput): Promise<void> {
    if (!input.email.includes('@')) throw new Error('Email inválido');
    if (input.password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres');
    if (!input.fullName.trim()) throw new Error('El nombre completo es obligatorio');
    if (!input.username.trim()) throw new Error('El usuario es obligatorio');
    if (!EMPLOYEE_CODE_PATTERN.test(input.employeeCode))
      throw new Error('El código de empleado debe tener el formato C12345 (C + 5 dígitos)');
    if (!input.position) throw new Error('Selecciona un cargo');
    if (!input.area) throw new Error('Selecciona un área');
    await this.authRepository.signUp(input);
  }
}
