import { type ReactNode, useEffect, useRef } from 'react';
import { useAuthStore } from '@/iam/interfaces/stores/auth.store';
import { DEFAULT_PERSONA, DEMO_PASSWORD } from '@/iam/demo/personas';

/**
 * MODO DEMO: no hay pantalla de login. Si no hay sesion, inicia sesion
 * automaticamente como la persona por defecto y muestra un splash breve
 * mientras autentica. Nunca redirige a una pantalla de login.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const signIn = useAuthStore((s) => s.signIn);
  const attempted = useRef(false);

  useEffect(() => {
    if (!user && !attempted.current) {
      attempted.current = true;
      void signIn(DEFAULT_PERSONA.username, DEMO_PASSWORD).catch(() => {
        // permitir un reintento si la autenticacion falla (backend caido, etc.)
        attempted.current = false;
      });
    }
  }, [user, signIn]);

  if (!user) {
    return (
      <div
        className="h-screen grid place-items-center"
        style={{ background: 'var(--ftx-bg)' }}
      >
        <div className="text-sm text-muted">Entrando a FLOWTEX…</div>
      </div>
    );
  }

  return <>{children}</>;
}
