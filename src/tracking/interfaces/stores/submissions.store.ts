import { create } from 'zustand';
import type { Decision, Submission } from '../../domain/models/Submission';
import { submissionRepository } from '../composition/tracking-container';

interface SubmissionsState {
  list: Submission[];
  current: Submission | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  scope: 'mine' | 'assigned' | 'all';
  setScope: (scope: 'mine' | 'assigned' | 'all') => void;
  loadList: () => Promise<void>;
  loadOne: (id: number) => Promise<void>;
  create: (formId: number, data: Record<string, unknown>) => Promise<Submission>;
  saveData: (id: number, data: Record<string, unknown>) => Promise<void>;
  decide: (id: number, execId: number, decision: Decision, comments?: string) => Promise<void>;
  resubmit: (id: number) => Promise<void>;
  cancel: (id: number) => Promise<void>;
  resetCurrent: () => void;
}

export const useSubmissionsStore = create<SubmissionsState>((set, get) => ({
  list: [],
  current: null,
  loading: false,
  saving: false,
  error: null,
  scope: 'mine',

  setScope: (scope) => set({ scope }),

  resetCurrent: () => set({ current: null, error: null }),

  loadList: async () => {
    set({ loading: true, error: null });
    try {
      const data = await submissionRepository.list(get().scope);
      set({ list: data, loading: false });
    } catch (e) {
      set({ error: extractError(e, 'Error cargando solicitudes'), loading: false });
    }
  },

  loadOne: async (id) => {
    set({ loading: true, error: null, current: null });
    try {
      const data = await submissionRepository.getById(id);
      set({ current: data, loading: false });
    } catch (e) {
      set({ error: extractError(e, 'Error cargando solicitud'), loading: false });
    }
  },

  create: async (formId, data) => {
    set({ saving: true, error: null });
    try {
      const created = await submissionRepository.create(formId, data);
      set({ saving: false, current: created });
      return created;
    } catch (e) {
      set({ error: extractError(e, 'Error al enviar solicitud'), saving: false });
      throw e;
    }
  },

  saveData: async (id, data) => {
    set({ saving: true, error: null });
    try {
      const updated = await submissionRepository.updateData(id, data);
      set({ current: updated, saving: false });
    } catch (e) {
      set({ error: extractError(e, 'Error guardando cambios'), saving: false });
      throw e;
    }
  },

  decide: async (id, execId, decision, comments) => {
    set({ saving: true, error: null });
    try {
      const updated = await submissionRepository.decide(id, execId, decision, comments);
      set({ current: updated, saving: false });
    } catch (e) {
      set({ error: extractError(e, 'Error registrando decisión'), saving: false });
      throw e;
    }
  },

  resubmit: async (id) => {
    set({ saving: true, error: null });
    try {
      const updated = await submissionRepository.resubmit(id);
      set({ current: updated, saving: false });
    } catch (e) {
      set({ error: extractError(e, 'Error reenviando solicitud'), saving: false });
      throw e;
    }
  },

  cancel: async (id) => {
    set({ saving: true, error: null });
    try {
      await submissionRepository.cancel(id);
      const refreshed = await submissionRepository.getById(id);
      set({ current: refreshed, saving: false });
    } catch (e) {
      set({ error: extractError(e, 'Error cancelando'), saving: false });
      throw e;
    }
  },
}));

function extractError(e: unknown, fallback: string): string {
  if (e && typeof e === 'object' && 'response' in e) {
    const r = (e as { response?: { data?: { message?: string } } }).response;
    if (r?.data?.message) return r.data.message;
  }
  return e instanceof Error ? e.message : fallback;
}
