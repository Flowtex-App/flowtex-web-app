import type { Form } from '../../domain/models/Form';
import type { IFormRepository } from '../../domain/ports/IFormRepository';

export class GetFormUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  execute(id: number): Promise<Form> {
    return this.formRepository.getById(id);
  }
}
