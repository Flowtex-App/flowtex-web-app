import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, type Role } from '../../domain/models/User';
import type { SignUpInput } from '../../domain/ports/IAuthRepository';
import {
  signInUseCase,
  signUpUseCase,
  signOutUseCase,
  iamPorts,
} from '../composition/iam-container';

interface PersistedUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: Role[];
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  hydrate: () => void;
}

const toPersisted = (user: User | null): PersistedUser | null =>
  user
    ? {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        roles: [...user.roles],
      }
    : null;

const fromPersisted = (data: PersistedUser | null): User | null =>
  data ? new User(data) : null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      signIn: async (username, password) => {
        set({ loading: true, error: null });
        try {
          const user = await signInUseCase.execute({ username, password });
          set({ user, loading: false });
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Error al iniciar sesion';
          set({ error: msg, loading: false });
          throw e;
        }
      },

      signUp: async (input) => {
        set({ loading: true, error: null });
        try {
          await signUpUseCase.execute(input);
          set({ loading: false });
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Error al crear cuenta';
          set({ error: msg, loading: false });
          throw e;
        }
      },

      signOut: async () => {
        await signOutUseCase.execute();
        set({ user: null });
      },

      hydrate: () => {
        const token = iamPorts.tokenStorage.read();
        if (!token) {
          set({ user: null });
        }
      },
    }),
    {
      name: 'flowtex.auth.user',
      partialize: (state) => ({ user: toPersisted(state.user) }),
      merge: (persisted, current) => {
        const persistedState = persisted as { user: PersistedUser | null } | undefined;
        return {
          ...current,
          user: fromPersisted(persistedState?.user ?? null),
        };
      },
    },
  ),
);
