import type { AxiosInstance } from 'axios';
import type { FieldType } from '../../domain/models/FieldType';
import type {
  FieldSuggestion,
  IAiSuggestionService,
  SuggestFieldsInput,
} from '../../domain/ports/IAiSuggestionService';

interface SuggestionDto {
  label: string;
  fieldKey: string;
  fieldType: string;
  rationale: string;
}

const KNOWN_TYPES: FieldType[] = [
  'TEXT', 'TEXTAREA', 'NUMBER', 'EMAIL', 'DATE', 'DATETIME',
  'SELECT', 'MULTI_SELECT', 'RADIO', 'CHECKBOX', 'FILE', 'URL', 'PHONE', 'SIGNATURE',
];

const normalizeType = (input: string): FieldType => {
  const upper = input?.toUpperCase().replace(/[^A-Z_]/g, '') ?? 'TEXT';
  return (KNOWN_TYPES.includes(upper as FieldType) ? upper : 'TEXT') as FieldType;
};

export class HttpAiSuggestionService implements IAiSuggestionService {
  constructor(private readonly http: AxiosInstance) {}

  async suggestFields(input: SuggestFieldsInput): Promise<FieldSuggestion[]> {
    const { data } = await this.http.post<SuggestionDto[]>('/forms/suggestions/fields', {
      formTitle: input.formTitle,
      formContext: input.formContext,
      maxSuggestions: input.maxSuggestions ?? 6,
    });

    return data.map((d) => ({
      label: d.label,
      fieldKey: d.fieldKey,
      fieldType: normalizeType(d.fieldType),
      rationale: d.rationale ?? '',
    }));
  }
}
