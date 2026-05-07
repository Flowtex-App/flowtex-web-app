import { create } from 'zustand';
import type { Form } from '../../domain/models/Form';
import type { FormDraft } from '../../domain/ports/IFormRepository';
import type { FieldSuggestion } from '../../domain/ports/IAiSuggestionService';
import {
  listFormsUseCase,
  getFormUseCase,
  saveFormUseCase,
  publishFormUseCase,
  deleteFormUseCase,
  suggestFieldsUseCase,
  formBuilderPorts,
} from '../composition/form-builder-container';

interface FormsState {
  forms: Form[];
  current: Form | null;
  loading: boolean;
  saving: boolean;
  error: string | null;

  suggestions: FieldSuggestion[];
  suggesting: boolean;
  suggestionError: string | null;

  loadForms: () => Promise<void>;
  loadForm: (id: number) => Promise<void>;
  saveForm: (input: { id?: number; draft: FormDraft }) => Promise<Form>;
  publishForm: (id: number) => Promise<void>;
  deleteForm: (id: number) => Promise<void>;
  suggestFields: (input: { formTitle: string; formContext: string; maxSuggestions?: number }) => Promise<void>;
  clearSuggestions: () => void;
  resetCurrent: () => void;

  linkWorkflow: (formId: number, workflowId: number | null) => Promise<Form>;
}

export const useFormsStore = create<FormsState>((set, get) => ({
  forms: [],
  current: null,
  loading: false,
  saving: false,
  error: null,

  suggestions: [],
  suggesting: false,
  suggestionError: null,

  loadForms: async () => {
    set({ loading: true, error: null });
    try {
      const forms = await listFormsUseCase.execute();
      set({ forms, loading: false });
    } catch (e) {
      set({ error: msgOf(e), loading: false });
    }
  },

  loadForm: async (id) => {
    set({ loading: true, error: null, current: null });
    try {
      const current = await getFormUseCase.execute(id);
      set({ current, loading: false });
    } catch (e) {
      set({ error: msgOf(e), loading: false });
    }
  },

  saveForm: async (input) => {
    set({ saving: true, error: null });
    try {
      const saved = await saveFormUseCase.execute(input);
      set({ saving: false, current: saved });
      return saved;
    } catch (e) {
      set({ error: msgOf(e), saving: false });
      throw e;
    }
  },

  publishForm: async (id) => {
    try {
      const updated = await publishFormUseCase.execute(id);
      const replaced = get().forms.map((f) => (f.id === id ? updated : f));
      set({ forms: replaced, current: get().current?.id === id ? updated : get().current });
    } catch (e) {
      set({ error: msgOf(e) });
      throw e;
    }
  },

  deleteForm: async (id) => {
    try {
      await deleteFormUseCase.execute(id);
      set({ forms: get().forms.filter((f) => f.id !== id) });
    } catch (e) {
      set({ error: msgOf(e) });
      throw e;
    }
  },

  suggestFields: async ({ formTitle, formContext, maxSuggestions }) => {
    set({ suggesting: true, suggestionError: null });
    try {
      const suggestions = await suggestFieldsUseCase.execute({
        formTitle,
        formContext,
        maxSuggestions,
      });
      set({ suggestions, suggesting: false });
    } catch (e) {
      set({ suggestionError: msgOf(e), suggesting: false });
    }
  },

  clearSuggestions: () => set({ suggestions: [], suggestionError: null }),
  resetCurrent: () => set({ current: null }),

  linkWorkflow: async (formId, workflowId) => {
    try {
      const updated = await formBuilderPorts.formRepository.linkWorkflow(formId, workflowId);
      set({ current: get().current?.id === formId ? updated : get().current });
      return updated;
    } catch (e) {
      set({ error: msgOf(e) });
      throw e;
    }
  },
}));

const msgOf = (e: unknown): string => {
  if (e && typeof e === 'object' && 'response' in e) {
    const ax = e as { response?: { data?: { message?: string } } };
    if (ax.response?.data?.message) return ax.response.data.message;
  }
  return e instanceof Error ? e.message : 'Error inesperado';
};
