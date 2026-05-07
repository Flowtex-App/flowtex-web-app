import { create } from 'zustand';
import { Workflow, type WorkflowDraft } from '../../domain/models/Workflow';
import { workflowRepository } from '../composition/workflow-container';

interface WorkflowState {
  workflows: Workflow[];
  current: Workflow | null;
  loading: boolean;
  saving: boolean;
  error: string | null;

  loadList: () => Promise<void>;
  loadOne: (id: number) => Promise<void>;
  saveOne: (input: { id?: number; draft: WorkflowDraft }) => Promise<Workflow>;
  publishOne: (id: number) => Promise<void>;
  removeOne: (id: number) => Promise<void>;
  resetCurrent: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: [],
  current: null,
  loading: false,
  saving: false,
  error: null,

  loadList: async () => {
    set({ loading: true, error: null });
    try {
      const workflows = await workflowRepository.list();
      set({ workflows, loading: false });
    } catch (e) {
      set({ error: msgOf(e), loading: false });
    }
  },

  loadOne: async (id) => {
    set({ loading: true, error: null, current: null });
    try {
      const current = await workflowRepository.getById(id);
      set({ current, loading: false });
    } catch (e) {
      set({ error: msgOf(e), loading: false });
    }
  },

  saveOne: async (input) => {
    set({ saving: true, error: null });
    try {
      const saved = input.id
        ? await workflowRepository.update(input.id, input.draft)
        : await workflowRepository.create(input.draft);
      set({ saving: false, current: saved });
      return saved;
    } catch (e) {
      set({ error: msgOf(e), saving: false });
      throw e;
    }
  },

  publishOne: async (id) => {
    try {
      const updated = await workflowRepository.publish(id);
      const replaced = get().workflows.map((w) => (w.id === id ? updated : w));
      set({ workflows: replaced, current: get().current?.id === id ? updated : get().current });
    } catch (e) {
      set({ error: msgOf(e) });
      throw e;
    }
  },

  removeOne: async (id) => {
    try {
      await workflowRepository.remove(id);
      set({ workflows: get().workflows.filter((w) => w.id !== id) });
    } catch (e) {
      set({ error: msgOf(e) });
      throw e;
    }
  },

  resetCurrent: () => set({ current: null }),
}));

const msgOf = (e: unknown): string => {
  if (e && typeof e === 'object' && 'response' in e) {
    const ax = e as { response?: { data?: { message?: string } } };
    if (ax.response?.data?.message) return ax.response.data.message;
  }
  return e instanceof Error ? e.message : 'Error inesperado';
};
