import type { Form } from '../../domain/models/Form';
import type { IFormRepository } from '../../domain/ports/IFormRepository';

export class PublishFormUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  execute(id: number): Promise<Form> {
    return this.formRepository.publish(id);
  }
}
