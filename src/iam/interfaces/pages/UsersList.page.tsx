import { useEffect, useState } from 'react';
import { Search, Users as UsersIcon, Shield, X } from 'lucide-react';
import { AppShell } from '@/shared/ui/components/AppShell';
import { useUsersStore } from '../stores/users.store';
import { useAuthStore } from '../stores/auth.store';
import { AREAS, areaLabel } from '../../domain/models/Area';
import { POSITIONS } from '../../domain/models/Position';
import type { Role, User } from '../../domain/models/User';

const ROLE_OPTIONS: { id: Role; label: string; hint: string }[] = [
  { id: 'ROLE_ADMIN',    label: 'Admin',    hint: 'Acceso total + gestión de usuarios' },
  { id: 'ROLE_DESIGNER', label: 'Diseñador', hint: 'Crea y edita formularios y workflows' },
  { id: 'ROLE_APPROVER', label: 'Aprobador', hint: 'Atiende solicitudes en flujos' },
  { id: 'ROLE_USER',     label: 'Usuario',   hint: 'Envía solicitudes' },
];

export default function UsersListPage() {
  const { users, loading, error, filter, setFilter, load } = useUsersStore();
  const me = useAuthStore((s) => s.user);
  const [selected, setSelected] = useState<User | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  const onApplyFilter = () => load();

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted">IAM</div>
          <h1 className="font-display font-extrabold text-2xl mt-1 text-ink">
            Gestión de usuarios
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Lista corporativa para asignar aprobadores y consultar roles. Solo admins pueden modificar roles.
          </p>
        </div>
      </div>

      <section className="ftx-card p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={filter.q}
              onChange={(e) => setFilter({ q: e.target.value })}
              placeholder="Buscar por código, nombre, usuario..."
              className="ftx-input pl-9 w-full"
              onKeyDown={(e) => e.key === 'Enter' && onApplyFilter()}
            />
          </div>
          <select
            className="ftx-input"
            value={filter.area}
            onChange={(e) => setFilter({ area: e.target.value as typeof filter.area })}
          >
            <option value="">Toda área</option>
            {AREAS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
          <select
            className="ftx-input"
            value={filter.position}
            onChange={(e) => setFilter({ position: e.target.value as typeof filter.position })}
          >
            <option value="">Todo cargo</option>
            {POSITIONS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <button onClick={onApplyFilter} className="ftx-btn ftx-btn-primary">Filtrar</button>
        </div>
      </section>

      {error && (
        <div className="mb-4 text-sm rounded p-3 bg-brand-soft border border-brand/30 text-brand-deep">
          {error}
        </div>
      )}

      <div className="ftx-card overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UsersIcon size={14} className="text-brand" />
            <span className="font-display font-bold text-sm text-ink">
              {users.length} {users.length === 1 ? 'usuario' : 'usuarios'}
            </span>
          </div>
        </div>

        {loading && <div className="p-6 text-muted text-sm">Cargando usuarios...</div>}
        {!loading && users.length === 0 && (
          <div className="p-8 text-center text-muted text-sm">Sin resultados.</div>
        )}
        {!loading && users.length > 0 && (
          <ul className="divide-y divide-line">
            {users.map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => setSelected(u)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-cream transition-colors text-left"
                >
                  <div
                    className="size-9 rounded grid place-items-center font-display font-bold text-[11px] text-white shrink-0"
                    style={{ background: 'var(--ftx-brand)' }}
                  >
                    {u.initials()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-ink truncate">{u.fullName}</span>
                      <span className="ftx-tag-flat font-mono">{u.employeeCode || '—'}</span>
                      <span className="ftx-tag-flat">@{u.username}</span>
                    </div>
                    <div className="text-xs text-muted mt-0.5 truncate">
                      {u.formattedPosition() || '—'} · {u.areaLabel || areaLabel(u.area) || '—'}
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-wrap gap-1 max-w-[260px] justify-end">
                    {u.roles.map((r) => (
                      <span key={r} className="ftx-tag-flat text-[9px]">{r.replace('ROLE_', '')}</span>
                    ))}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <UserDetailModal
          user={selected}
          canEditRoles={!!me?.isAdmin()}
          onClose={() => setSelected(null)}
        />
      )}
    </AppShell>
  );
}

function UserDetailModal({
  user, canEditRoles, onClose,
}: {
  user: User;
  canEditRoles: boolean;
  onClose: () => void;
}) {
  const updateRoles = useUsersStore((s) => s.updateRoles);
  const [roles, setRoles] = useState<Role[]>([...user.roles]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleRole = (r: Role) => {
    setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };

  const onSave = async () => {
    if (roles.length === 0) {
      setError('El usuario debe tener al menos un rol');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateRoles(user.id, roles);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-6"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="ftx-card-elev max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded grid place-items-center font-display font-bold text-sm text-white"
              style={{ background: 'var(--ftx-brand)' }}
            >
              {user.initials()}
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-base text-ink truncate">{user.fullName}</div>
              <div className="text-xs text-muted font-mono">{user.employeeCode} · @{user.username}</div>
            </div>
          </div>
          <button onClick={onClose} className="ftx-icon-btn"><X size={14} /></button>
        </header>

        <div className="px-5 py-4 space-y-4">
          <Section label="Datos">
            <Row k="Email"     v={user.email} />
            <Row k="Cargo"     v={user.formattedPosition() || '—'} />
            <Row k="Área"      v={user.areaLabel || '—'} />
          </Section>

          <Section label="Roles" icon={<Shield size={12} className="text-brand" />}>
            <div className="space-y-1.5 mt-1">
              {ROLE_OPTIONS.map((opt) => {
                const active = roles.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className={[
                      'flex items-start gap-2.5 px-3 py-2 rounded border cursor-pointer transition-colors',
                      active ? 'border-brand bg-brand-tint' : 'border-line bg-paper hover:border-steel',
                      !canEditRoles ? 'opacity-60 cursor-not-allowed' : '',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => canEditRoles && toggleRole(opt.id)}
                      disabled={!canEditRoles}
                      className="mt-0.5 accent-brand size-3.5"
                    />
                    <div>
                      <div className="text-[12px] font-medium text-ink">{opt.label}</div>
                      <div className="text-[10px] text-muted leading-snug">{opt.hint}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </Section>

          {error && (
            <div className="text-xs rounded p-2 bg-brand-soft border border-brand/30 text-brand-deep">
              {error}
            </div>
          )}
        </div>

        <footer className="px-5 py-3 border-t border-line bg-cream flex items-center justify-end gap-2">
          <button onClick={onClose} className="ftx-btn">Cerrar</button>
          {canEditRoles && (
            <button onClick={onSave} disabled={saving} className="ftx-btn ftx-btn-primary">
              {saving ? 'Guardando...' : 'Guardar roles'}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

function Section({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12px] py-1 border-b border-line/40 last:border-b-0">
      <span className="text-muted">{k}</span>
      <span className="text-ink truncate">{v}</span>
    </div>
  );
}
