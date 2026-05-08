import { create } from 'zustand';
import { User, type Role } from '../../domain/models/User';
import type { Area } from '../../domain/models/Area';
import type { Position } from '../../domain/models/Position';
import { userRepository } from '../composition/iam-container';

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  filter: { q: string; area: Area | ''; position: Position | '' };
  setFilter: (patch: Partial<UsersState['filter']>) => void;
  load: () => Promise<void>;
  updateRoles: (userId: number, roles: Role[]) => Promise<void>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  filter: { q: '', area: '', position: '' },

  setFilter: (patch) => {
    set({ filter: { ...get().filter, ...patch } });
  },

  load: async () => {
    set({ loading: true, error: null });
    try {
      const { q, area, position } = get().filter;
      const users = await userRepository.list({
        q: q || undefined,
        area: area || undefined,
        position: position || undefined,
      });
      set({ users, loading: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error cargando usuarios';
      set({ error: msg, loading: false });
    }
  },

  updateRoles: async (userId, roles) => {
    const updated = await userRepository.updateRoles(userId, roles);
    set({ users: get().users.map((u) => (u.id === userId ? updated : u)) });
  },
}));
