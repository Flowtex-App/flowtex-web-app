import type { IFormRepository } from '../../domain/ports/IFormRepository';

export class DeleteFormUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  execute(id: number): Promise<void> {
    return this.formRepository.remove(id);
  }
}
