import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { Button } from '@/shared/ui/components/Button';
import { TextField } from '@/shared/ui/components/Field';

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signUp({ username, email, fullName, password });
      navigate('/sign-in');
    } catch {
      // error en el store
    }
  };

  return (
    <div className="min-h-screen ftx-grid-bg flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Link to="/sign-in" className="inline-flex items-center gap-2 mb-6 hover:opacity-70">
          <div className="size-9 bg-flame border-[3px] border-ink shadow-[3px_3px_0_0_var(--color-ink)] flex items-center justify-center">
            <Sparkles size={16} strokeWidth={2.5} className="text-paper" />
          </div>
          <span className="font-display font-bold tracking-tight">FLOWTEX</span>
        </Link>

        <form onSubmit={onSubmit} className="ftx-card p-8 space-y-5">
          <div>
            <span className="ftx-tag ftx-tag-citron">registro</span>
            <h1 className="font-display font-bold text-3xl mt-3">Crear cuenta nueva</h1>
            <p className="text-sm text-ink/60 mt-1">
              Activa tu acceso al FormBuilder de Hitss / Claro Peru.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <TextField label="Nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required />

          <TextField
            label="Contrasena"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            hint="Minimo 8 caracteres"
            required
          />

          {error && (
            <div className="border-[3px] border-flame bg-blush p-3 text-sm font-medium">{error}</div>
          )}

          <Button type="submit" variant="primary" size="lg" block disabled={loading}>
            {loading ? 'Creando...' : 'Crear cuenta'} <ArrowRight size={18} />
          </Button>

          <div className="border-t-2 border-dashed border-ink/30 pt-4 text-sm text-ink/70 flex items-center justify-between">
            <span>Ya tienes cuenta?</span>
            <Link to="/sign-in" className="font-display font-semibold underline underline-offset-4 decoration-flame decoration-[3px]">
              Iniciar sesion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
