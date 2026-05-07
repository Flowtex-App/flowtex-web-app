import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { Button } from '@/shared/ui/components/Button';
import { TextField } from '@/shared/ui/components/Field';

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
      // error en el store
    }
  };

  return (
    <div className="min-h-screen ftx-grid-bg flex flex-col">
      <div className="flex-1 grid lg:grid-cols-[1.1fr_1fr] max-w-[1400px] mx-auto w-full">
        {/* Brand panel */}
        <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden border-r-[3px] border-ink">
          <div className="flex items-center gap-3">
            <div className="size-12 bg-flame border-[3px] border-ink shadow-[4px_4px_0_0_var(--color-ink)] flex items-center justify-center">
              <Sparkles size={22} strokeWidth={2.5} className="text-paper" />
            </div>
            <div>
              <div className="font-display font-bold text-2xl tracking-tight">FLOWTEX</div>
              <div className="text-xs uppercase font-mono tracking-widest text-ink/60">Form Operations Platform</div>
            </div>
          </div>

          <div className="relative">
            <h1 className="font-display font-bold text-6xl leading-[0.95] tracking-tight">
              Disena{' '}
              <span className="bg-citron px-2 inline-block border-[3px] border-ink shadow-[4px_4px_0_0_var(--color-ink)]">
                formularios
              </span>
              <br />
              con cabeza.
            </h1>
            <p className="mt-6 text-lg text-ink/70 max-w-md">
              Construye, versiona y publica los flujos de Claro Peru sin escribir scripts ni esperar 6 semanas a un proveedor externo.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-3">
              <Stat label="Formularios" value="6" tag="activos" />
              <Stat label="Migracion" value="42%" tag="oleada 3" />
              <Stat label="SLA" value="99.7%" tag="uptime" />
            </div>
          </div>

          <div className="text-xs font-mono text-ink/50 flex items-center gap-3">
            <span>Hitss Peru / Claro Peru</span>
            <span className="size-1.5 rounded-full bg-ink/40" />
            <span>ISO 12207 · ISO 27001</span>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <form onSubmit={onSubmit} className="w-full max-w-md ftx-card p-8 space-y-5">
            <div>
              <span className="ftx-tag ftx-tag-blush">acceso</span>
              <h2 className="font-display font-bold text-3xl mt-3">Iniciar sesion</h2>
              <p className="text-sm text-ink/60 mt-1">
                Usa tu cuenta corporativa o la cuenta demo precargada.
              </p>
            </div>

            <TextField
              label="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />

            <TextField
              label="Contrasena"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {error && (
              <div className="border-[3px] border-flame bg-blush p-3 text-sm font-medium">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" block disabled={loading}>
              {loading ? 'Ingresando...' : 'Entrar'} <ArrowRight size={18} />
            </Button>

            <div className="border-t-2 border-dashed border-ink/30 pt-4 text-sm text-ink/70 flex items-center justify-between">
              <span>Aun no tienes cuenta?</span>
              <Link to="/sign-up" className="font-display font-semibold underline underline-offset-4 decoration-flame decoration-[3px]">
                Crear una
              </Link>
            </div>

            <div className="ftx-card-cream p-3 text-xs font-mono leading-relaxed">
              <div className="font-bold uppercase tracking-wider mb-1">Demo</div>
              <div>usuario: <code className="bg-paper px-1">demo</code></div>
              <div>password: <code className="bg-paper px-1">Flowtex2026!</code></div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tag }: { label: string; value: string; tag: string }) {
  return (
    <div className="ftx-card-cream p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-ink/60">{label}</div>
      <div className="font-display font-bold text-2xl">{value}</div>
      <div className="text-xs text-ink/70">{tag}</div>
    </div>
  );
}
