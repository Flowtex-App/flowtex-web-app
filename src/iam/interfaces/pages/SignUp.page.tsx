import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
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
      // error en store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-lg">
        <Link to="/sign-in" className="inline-flex items-center gap-2 mb-6 hover:opacity-70">
          <div className="size-9 bg-brand rounded grid place-items-center">
            <Layers size={16} className="text-white" />
          </div>
          <span className="font-display font-extrabold tracking-tight">FLOWTEX</span>
        </Link>

        <form onSubmit={onSubmit} className="ftx-card-elev p-8 space-y-5">
          <div>
            <span className="ftx-tag ftx-tag-brand">Registro</span>
            <h1 className="font-display font-bold text-2xl mt-3 text-ink">Crear cuenta nueva</h1>
            <p className="text-sm text-muted mt-1">
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
            <div className="bg-brand-soft border border-brand/30 text-brand-deep text-sm rounded-md p-3">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" block disabled={loading}>
            {loading ? 'Creando...' : 'Crear cuenta'} <ArrowRight size={16} />
          </Button>

          <div className="text-sm text-muted flex items-center justify-between pt-2 border-t border-line">
            <span>Ya tienes cuenta?</span>
            <Link to="/sign-in" className="font-semibold text-brand hover:text-brand-dark">
              Iniciar sesion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
