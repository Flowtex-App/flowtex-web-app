import { create } from 'zustand';
import type { User } from '../../domain/models/User';
import { signInUseCase, signUpUseCase, signOutUseCase } from '../composition/iam-container';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (input: { username: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Store de estado de UI para autenticación. Vive en `interfaces/` porque
 * es un detalle de presentación: orquesta el llamado a casos de uso
 * y expone estado reactivo a los componentes.
 *
 * NO contiene reglas de negocio. Esas viven en use cases y dominio.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  signIn: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const user = await signInUseCase.execute({ username, password });
      set({ user, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Error', loading: false });
      throw e;
    }
  },

  signUp: async (input) => {
    set({ loading: true, error: null });
    try {
      await signUpUseCase.execute(input);
      set({ loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Error', loading: false });
      throw e;
    }
  },

  signOut: async () => {
    await signOutUseCase.execute();
    set({ user: null });
  },
}));
