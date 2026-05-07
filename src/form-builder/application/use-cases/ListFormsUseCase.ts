import type { Form } from '../../domain/models/Form';
import type { IFormRepository } from '../../domain/ports/IFormRepository';

export class ListFormsUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  execute(): Promise<Form[]> {
    return this.formRepository.list();
  }
}
