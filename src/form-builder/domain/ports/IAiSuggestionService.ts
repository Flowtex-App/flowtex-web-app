import type { FieldType } from '../models/FieldType';

export interface FieldSuggestion {
  label: string;
  fieldKey: string;
  fieldType: FieldType;
  rationale: string;
}

export interface SuggestFieldsInput {
  formTitle: string;
  formContext: string;
  maxSuggestions?: number;
}

export interface IAiSuggestionService {
  suggestFields(input: SuggestFieldsInput): Promise<FieldSuggestion[]>;
}
