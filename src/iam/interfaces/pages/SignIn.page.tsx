import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Layers, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { Button } from '@/shared/ui/components/Button';

export default function SignInPage() {
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('Flowtex2026!');
  const [showPwd, setShowPwd] = useState(false);
  const { signIn, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signIn(username, password);
      navigate('/dashboard');
    } catch {
      // store handles error
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-bg">
      {/* ── Left panel: dark, high contrast ─────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 xl:p-16 relative overflow-hidden"
        style={{ background: 'var(--ftx-deep)', color: '#FFFFFF' }}
      >
        {/* Diagonal stripe accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand" />
        <div className="absolute -right-32 -top-32 size-96 rounded-full opacity-20" style={{ background: 'var(--ftx-brand)' }} />
        <div className="absolute -left-20 -bottom-20 size-80 rounded-full opacity-10" style={{ background: '#FFFFFF' }} />

        {/* Brand */}
        <div className="flex items-center gap-3 relative">
          <div
            className="size-12 rounded grid place-items-center"
            style={{ background: 'var(--ftx-brand)', boxShadow: '0 0 0 2px rgba(255,255,255,0.15)' }}
          >
            <Layers size={22} className="text-white" />
          </div>
          <div>
            <div className="font-display font-extrabold text-2xl tracking-tight text-white">
              FLOWTEX
            </div>
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/55">
              Form Operations / Hitss
            </div>
          </div>
        </div>

        {/* Editorial headline */}
        <div className="relative">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55 mb-3">
            inhouse · interno · soberano
          </div>
          <h1 className="font-editorial italic text-[3.2rem] xl:text-[3.8rem] leading-[1.05] text-white">
            Diseña, valida
            <br />
            <span style={{ color: 'var(--ftx-brand)' }}>y publica</span>
            <br />
            sin esperar.
          </h1>
          <p className="mt-6 text-[15px] text-white/75 max-w-md leading-relaxed">
            Plataforma de formularios y flujos de aprobación para el área de
            Tecnología de Claro Perú. Operada por Hitss.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            <Stat label="Forms" value="6" hint="activos" />
            <Stat label="Migración" value="42%" hint="oleada 3" />
            <Stat label="Uptime" value="99.7%" hint="30d" />
          </div>
        </div>

        <div className="relative flex items-center justify-between text-[11px] text-white/45 font-mono">
          <span>Hitss Perú · Claro Perú</span>
          <span className="flex items-center gap-2">
            <span className="size-1 rounded-full bg-white/40" />
            ISO 12207 · 27001
          </span>
        </div>
      </div>

      {/* ── Right panel: form on paper ────────────────────────── */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14" style={{ background: 'var(--ftx-paper)' }}>
        <form onSubmit={onSubmit} className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div
              className="size-10 rounded grid place-items-center"
              style={{ background: 'var(--ftx-brand)' }}
            >
              <Layers size={18} className="text-white" />
            </div>
            <div>
              <div className="font-display font-extrabold text-lg tracking-tight text-ink">FLOWTEX</div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-muted">
                Form Operations
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted mb-2">
              acceso · 01
            </div>
            <h2 className="font-display font-bold text-[2rem] leading-tight text-ink">
              Inicia sesión
            </h2>
            <p className="text-sm text-ink-2 mt-2 leading-relaxed">
              Usa tu cuenta corporativa o la <span className="font-mono text-brand">cuenta demo</span> precargada.
            </p>
          </div>

          {/* Form fields */}
          <div className="space-y-5">
            <Field
              label="Usuario"
              code="01"
              icon={<UserIcon size={15} />}
            >
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="ftx-input pl-10 text-[15px] py-2.5"
                placeholder="usuario corporativo"
                autoComplete="username"
                required
              />
            </Field>

            <Field
              label="Contraseña"
              code="02"
              icon={<Lock size={15} />}
              right={
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="ftx-icon-btn !w-7 !h-7"
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            >
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ftx-input pl-10 pr-12 text-[15px] py-2.5"
                placeholder="contraseña"
                autoComplete="current-password"
                required
              />
            </Field>
          </div>

          {error && (
            <div
              className="mt-5 p-3 text-sm rounded font-medium"
              style={{
                background: 'var(--ftx-brand-soft)',
                color: 'var(--ftx-brand-deep)',
                border: '1px solid var(--ftx-brand)',
              }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            block
            disabled={loading}
            className="mt-6 !text-[15px] !py-3"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
            <ArrowRight size={17} />
          </Button>

          <div className="mt-5 text-sm flex items-center justify-between text-ink-2">
            <span>¿No tienes cuenta?</span>
            <Link
              to="/sign-up"
              className="font-medium text-brand hover:text-brand-dark transition-colors"
            >
              Crear una →
            </Link>
          </div>

          {/* Demo info */}
          <div
            className="mt-8 p-4 rounded-md text-[12px] leading-relaxed"
            style={{
              background: 'var(--ftx-cream)',
              border: '1px solid var(--ftx-line-strong)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="size-2 rounded-full"
                style={{ background: 'var(--ftx-success)', boxShadow: '0 0 0 3px var(--ftx-cream), 0 0 0 4px var(--ftx-success)' }}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                cuenta demo precargada
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] text-muted font-mono uppercase tracking-wider">user</div>
                <code className="block mt-0.5 px-2 py-1 rounded text-[12px] font-mono text-ink"
                  style={{ background: 'var(--ftx-paper)', border: '1px solid var(--ftx-line)' }}
                >
                  demo
                </code>
              </div>
              <div>
                <div className="text-[10px] text-muted font-mono uppercase tracking-wider">pass</div>
                <code className="block mt-0.5 px-2 py-1 rounded text-[12px] font-mono text-ink"
                  style={{ background: 'var(--ftx-paper)', border: '1px solid var(--ftx-line)' }}
                >
                  Flowtex2026!
                </code>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div
      className="rounded-md p-3"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <div className="text-[10px] font-mono uppercase tracking-widest text-white/55">
        {label}
      </div>
      <div className="font-display font-bold text-2xl mt-1 text-white">{value}</div>
      <div className="text-[11px] text-white/55">{hint}</div>
    </div>
  );
}

function Field({
  label, code, icon, right, children,
}: {
  label: string;
  code: string;
  icon: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12px] font-semibold text-ink">{label}</span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
          {code}
        </span>
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          {icon}
        </span>
        {children}
        {right && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">{right}</span>
        )}
      </div>
    </label>
  );
}
