import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Layers, Lock, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { Button } from '@/shared/ui/components/Button';

export default function SignInPage() {
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('Flowtex2026!');
  const { signIn, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signIn(username, password);
      navigate('/dashboard');
    } catch {
      // error en store
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-bg">
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-nav text-white">
        <div className="absolute inset-0 opacity-10 ftx-grid-bg" />
        <div className="absolute top-0 left-0 w-full h-1.5 bg-brand" />

        <div className="flex items-center gap-3 relative">
          <div className="size-11 bg-brand rounded grid place-items-center shadow-lg shadow-brand/40">
            <Layers size={20} className="text-white" />
          </div>
          <div>
            <div className="font-display font-extrabold text-2xl tracking-tight">FLOWTEX</div>
            <div className="text-xs uppercase tracking-widest text-white/60">Form Operations Platform</div>
          </div>
        </div>

        <div className="relative">
          <h1 className="font-display font-extrabold text-5xl xl:text-6xl leading-[1.05] tracking-tight">
            Disena, valida y publica
            <br />
            tus formularios sin esperar
            <br />
            <span className="text-brand">a un proveedor externo.</span>
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-md">
            Plataforma interna de gestion de formularios y flujos de aprobacion
            para el area de Tecnologia de Claro Peru. Operada por Hitss Peru.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            <Stat label="Formularios" value="6" hint="activos" />
            <Stat label="Migracion" value="42%" hint="oleada 3" />
            <Stat label="Uptime" value="99.7%" hint="30 dias" />
          </div>
        </div>

        <div className="text-xs text-white/40 flex items-center gap-3 relative">
          <span>Hitss Peru / Claro Peru</span>
          <span className="size-1 rounded-full bg-white/30" />
          <span>ISO 12207 / 27001</span>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-surface">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-5">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="size-9 bg-brand rounded grid place-items-center">
              <Layers size={16} className="text-white" />
            </div>
            <span className="font-display font-extrabold tracking-tight">FLOWTEX</span>
          </div>

          <div>
            <span className="ftx-tag ftx-tag-brand">Acceso</span>
            <h2 className="font-display font-bold text-3xl mt-3 text-ink">Bienvenido de vuelta</h2>
            <p className="text-sm text-muted mt-1.5">
              Inicia sesion con tu cuenta corporativa o usa la cuenta demo precargada.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-2">Usuario</span>
              <div className="relative mt-1.5">
                <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="ftx-input pl-9"
                  placeholder="usuario corporativo"
                  autoComplete="username"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-2">Contrasena</span>
              <div className="relative mt-1.5">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ftx-input pl-9"
                  autoComplete="current-password"
                  required
                />
              </div>
            </label>
          </div>

          {error && (
            <div className="bg-brand-soft border border-brand/30 text-brand-deep text-sm rounded-md p-3">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" block disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesion'} <ArrowRight size={16} />
          </Button>

          <div className="text-sm text-muted flex items-center justify-between pt-2">
            <span>No tienes cuenta?</span>
            <Link to="/sign-up" className="font-semibold text-brand hover:text-brand-dark">
              Crear una nueva
            </Link>
          </div>

          <div className="rounded-md bg-surface-2 border border-line p-3 text-xs text-ink-2 leading-relaxed">
            <div className="font-semibold text-ink mb-1 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-success" /> Cuenta demo
            </div>
            <div>usuario: <code className="bg-white px-1.5 py-0.5 rounded text-brand-deep border border-line">demo</code></div>
            <div className="mt-0.5">password: <code className="bg-white px-1.5 py-0.5 rounded text-brand-deep border border-line">Flowtex2026!</code></div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-md p-3">
      <div className="text-[10px] uppercase tracking-wider text-white/50">{label}</div>
      <div className="font-display font-bold text-2xl mt-1 text-white">{value}</div>
      <div className="text-xs text-white/60">{hint}</div>
    </div>
  );
}
