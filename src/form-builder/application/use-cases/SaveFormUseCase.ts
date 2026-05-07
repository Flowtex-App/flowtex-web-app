import type { Form } from '../../domain/models/Form';
import type { FormDraft, IFormRepository } from '../../domain/ports/IFormRepository';

export class SaveFormUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute(input: { id?: number; draft: FormDraft }): Promise<Form> {
    if (!input.draft.title?.trim()) throw new Error('El titulo es obligatorio');
    if (input.draft.fields.length === 0) throw new Error('Agrega al menos un campo');

    const seenKeys = new Set<string>();
    for (const field of input.draft.fields) {
      if (seenKeys.has(field.fieldKey)) {
        throw new Error(`Clave duplicada: ${field.fieldKey}`);
      }
      seenKeys.add(field.fieldKey);
    }

    if (input.id) {
      return this.formRepository.update(input.id, input.draft);
    }
    return this.formRepository.create(input.draft);
  }
}
