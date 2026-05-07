import type {
  FieldSuggestion,
  IAiSuggestionService,
  SuggestFieldsInput,
} from '../../domain/ports/IAiSuggestionService';

export class SuggestFieldsUseCase {
  constructor(private readonly aiService: IAiSuggestionService) {}

  async execute(input: SuggestFieldsInput): Promise<FieldSuggestion[]> {
    if (!input.formContext?.trim() && !input.formTitle?.trim()) {
      throw new Error('Necesito un titulo o contexto para sugerir campos');
    }
    return this.aiService.suggestFields({
      ...input,
      maxSuggestions: input.maxSuggestions ?? 6,
    });
  }
}
