import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { Button } from '@/shared/ui/components/Button';
import { TextField } from '@/shared/ui/components/Field';
import { AREAS, type Area, EMPLOYEE_CODE_PATTERN } from '../../domain/models/Area';
import { POSITIONS, type Position } from '../../domain/models/Position';

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [position, setPosition] = useState<Position | ''>('');
  const [positionSpecialty, setPositionSpecialty] = useState('');
  const [area, setArea] = useState<Area | ''>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { signUp, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!EMPLOYEE_CODE_PATTERN.test(employeeCode)) {
      setLocalError('El código de empleado debe tener el formato C12345 (C + 5 dígitos)');
      return;
    }
    if (!position) {
      setLocalError('Selecciona un cargo');
      return;
    }
    if (!area) {
      setLocalError('Selecciona un área');
      return;
    }
    try {
      await signUp({
        username,
        email,
        fullName,
        password,
        employeeCode,
        position,
        positionSpecialty: positionSpecialty.trim() || undefined,
        area,
      });
      navigate('/sign-in');
    } catch {
      // error en store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6 py-10">
      <div className="w-full max-w-2xl">
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
              Activa tu acceso al FormBuilder de Claro Perú. Tu código y cargo se usan
              para asignarte como aprobador en flujos de tu área.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <TextField label="Email corporativo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <TextField label="Nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Código de empleado"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value.trim().toUpperCase())}
              hint="Formato C12345"
              maxLength={6}
              required
            />
            <SelectField
              label="Área"
              value={area}
              onChange={(v) => setArea(v as Area | '')}
              required
            >
              <option value="">Seleccionar área...</option>
              {AREAS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </SelectField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Cargo"
              value={position}
              onChange={(v) => setPosition(v as Position | '')}
              required
            >
              <option value="">Seleccionar cargo...</option>
              {POSITIONS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </SelectField>
            <TextField
              label="Especialidad"
              value={positionSpecialty}
              onChange={(e) => setPositionSpecialty(e.target.value)}
              hint="Ej: de Sistemas, de Backend, de QA"
            />
          </div>

          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            hint="Mínimo 8 caracteres"
            required
          />

          {(error || localError) && (
            <div className="bg-brand-soft border border-brand/30 text-brand-deep text-sm rounded-md p-3">
              {localError || error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" block disabled={loading}>
            {loading ? 'Creando...' : 'Crear cuenta'} <ArrowRight size={16} />
          </Button>

          <div className="text-sm text-muted flex items-center justify-between pt-2 border-t border-line">
            <span>¿Ya tienes cuenta?</span>
            <Link to="/sign-in" className="font-semibold text-brand hover:text-brand-dark">
              Iniciar sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function SelectField({
  label, value, onChange, required, children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-semibold text-ink mb-1.5 block">
        {label} {required && <span className="text-brand">*</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="ftx-input w-full text-sm"
      >
        {children}
      </select>
    </label>
  );
}
