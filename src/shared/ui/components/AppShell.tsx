import { type ReactNode, useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Repeat, Inbox, FileSpreadsheet, Search, FolderKanban,
  Users, ChevronDown, ChevronRight, Menu, X, Layers,
  Building2, Briefcase, BadgeCheck, Shield, ChevronUp, Plus,
} from 'lucide-react';
import { useAuthStore } from '@/iam/interfaces/stores/auth.store';
import { ThemeMenu } from '@/shared/ui/theme/ThemeMenu';
import { DEMO_PERSONAS, DEMO_PASSWORD } from '@/iam/demo/personas';
import { iamPorts } from '@/iam/interfaces/composition/iam-container';
import type { User } from '@/iam/domain/models/User';

interface AppShellProps {
  children: ReactNode;
  fitViewport?: boolean;
}

interface NavLeaf {
  to: string;
  label: string;
  icon?: ReactNode;
  end?: boolean;
  /** When set, only users with one of these roles see the entry. */
  requiresRole?: string[];
}

interface NavGroup {
  id: string;
  title: string;
  items: NavLeaf[];
}

const navGroups: NavGroup[] = [
  {
    id: 'bandejas',
    title: 'Bandejas',
    items: [
      { to: '/dashboard',                  label: 'Mi cola',          icon: <Inbox size={14} />, end: true },
      { to: '/submissions?scope=mine',     label: 'Mis solicitudes',  icon: <FileSpreadsheet size={14} /> },
      { to: '/submissions?scope=assigned', label: 'Por aprobar',      icon: <Inbox size={14} /> },
      { to: '/submissions?scope=all',      label: 'Todas',            icon: <Search size={14} /> },
    ],
  },
  {
    id: 'diseno',
    title: 'Diseño',
    items: [
      { to: '/forms',     label: 'Formularios',  icon: <FolderKanban size={14} /> },
      { to: '/forms/new', label: 'Nuevo form',   icon: <Plus size={14} /> },
    ],
  },
  {
    id: 'gestion',
    title: 'Gestión',
    items: [
      { to: '/users',   label: 'Usuarios',  icon: <Users size={14} /> },
    ],
  },
];

export function AppShell({ children, fitViewport = false }: AppShellProps) {
  const { user, signIn } = useAuthStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const onActAs = async (username: string) => {
    setUserMenuOpen(false);
    await signIn(username, DEMO_PASSWORD);
  };

  const toggleGroup = (id: string) =>
    setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--ftx-bg)' }}>
      {/* Sidebar */}
      <aside
        className={[
          'fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
        style={{
          background: 'var(--ftx-paper)',
          borderRight: '1px solid var(--ftx-line)',
        }}
      >
        {/* Brand */}
        <div
          className="h-14 px-4 flex items-center gap-2.5 shrink-0"
          style={{ borderBottom: '1px solid var(--ftx-line)' }}
        >
          <div
            className="size-8 rounded grid place-items-center"
            style={{ background: 'var(--ftx-brand)', boxShadow: '0 0 0 1px rgba(0,0,0,0.1)' }}
          >
            <Layers size={15} className="text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-extrabold text-[15px] tracking-tight text-ink">
              FLOWTEX
            </div>
            <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-muted">
              claro perú
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden ftx-icon-btn"
            aria-label="Cerrar menu"
          >
            <X size={14} />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto py-2 text-ink-2">
          {navGroups.map((group) => {
            const isCollapsed = !!collapsedGroups[group.id];
            return (
              <div key={group.id} className="pb-1.5">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between ftx-nav-section-title hover:text-ink"
                >
                  <span>{group.title}</span>
                  {isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                </button>
                {!isCollapsed && (
                  <div className="space-y-0">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to + item.label}
                        to={item.to}
                        end={item.end}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) => {
                          // Los items de /submissions comparten pathname; el activo
                          // depende del ?scope= para no resaltar los tres a la vez.
                          if (item.to.startsWith('/submissions?scope=')) {
                            const itemScope = new URLSearchParams(item.to.split('?')[1]).get('scope');
                            const curScope = new URLSearchParams(location.search).get('scope');
                            const on = location.pathname.startsWith('/submissions') && curScope === itemScope;
                            return `ftx-nav-link ${on ? 'active' : ''}`;
                          }
                          return `ftx-nav-link ${isActive ? 'active' : ''}`;
                        }}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User card in sidebar — replaces fake telemetry footer */}
        {user && (
          <div
            ref={userMenuRef}
            className="px-3 py-2.5 relative"
            style={{ borderTop: '1px solid var(--ftx-line)' }}
          >
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className={[
                'w-full flex items-center gap-2.5 px-2 py-2 rounded transition-colors text-left',
                userMenuOpen ? 'bg-cream' : 'hover:bg-cream',
              ].join(' ')}
            >
              <div
                className="size-8 rounded grid place-items-center font-display font-bold text-[11px] text-white shrink-0"
                style={{ background: 'var(--ftx-brand)' }}
              >
                {user.initials()}
              </div>
              <div className="flex-1 min-w-0 leading-tight">
                <div className="text-[12px] font-medium text-ink truncate">{user.fullName}</div>
                <div className="text-[10px] text-muted font-mono truncate">
                  {user.employeeCode || '@' + user.username}
                </div>
              </div>
              {userMenuOpen ? <ChevronDown size={12} className="text-muted" /> : <ChevronUp size={12} className="text-muted" />}
            </button>

            {userMenuOpen && (
              <div
                className="absolute bottom-full left-3 right-3 mb-2 rounded overflow-hidden shadow-lg"
                style={{ background: 'var(--ftx-paper)', border: '1px solid var(--ftx-line-strong)' }}
              >
                <div className="px-3 py-2.5 border-b border-line bg-cream">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1.5">
                    sesión activa
                  </div>
                  <UserMetaRow icon={<BadgeCheck size={11} />} label={user.employeeCode || '—'} />
                  <UserMetaRow icon={<Briefcase size={11} />} label={user.formattedPosition() || '—'} />
                  <UserMetaRow icon={<Building2 size={11} />} label={user.areaLabel || '—'} />
                  <UserMetaRow
                    icon={<Shield size={11} />}
                    label={user.roles.map((r) => r.replace('ROLE_', '')).join(' · ') || '—'}
                  />
                </div>
                <div className="px-3 pt-2 pb-1">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted flex items-center gap-1.5">
                    <Repeat size={11} className="text-brand" /> actuar como (demo)
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto pb-1">
                  {DEMO_PERSONAS.filter((p) => p.username !== user.username).map((p) => (
                    <button
                      key={p.key}
                      onClick={() => onActAs(p.username)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] text-ink hover:bg-cream"
                    >
                      <Users size={13} className="text-muted shrink-0" />
                      <span className="flex-1 min-w-0 leading-tight">
                        <span className="block truncate">{p.label}</span>
                        <span className="block text-[10px] text-muted truncate">{p.roleLabel}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-14 flex items-center justify-between px-4 lg:px-5 shrink-0 gap-3"
          style={{
            background: 'var(--ftx-paper)',
            borderBottom: '1px solid var(--ftx-line)',
          }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden ftx-icon-btn"
              aria-label="Abrir menu"
            >
              <Menu size={16} />
            </button>

            {/* Búsqueda global con opciones diferenciadas */}
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeMenu />
            {user?.isAdmin() && (
              <span
                className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono uppercase tracking-widest"
                style={{
                  background: 'var(--ftx-brand-soft)',
                  color: 'var(--ftx-brand-deep)',
                  border: '1px solid var(--ftx-brand)',
                }}
              >
                <Shield size={10} /> admin
              </span>
            )}
          </div>
        </header>

        <main className={fitViewport ? 'flex-1 overflow-hidden min-h-0' : 'flex-1 overflow-y-auto'}>
          {fitViewport ? (
            <div className="h-full">{children}</div>
          ) : (
            <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-[1400px] mx-auto w-full">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function UserMetaRow({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-ink-2 py-0.5 truncate">
      <span className="text-muted shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

/**
 * Búsqueda global: despliega un panel con opciones diferenciadas.
 * - Sección "Usuarios": resultados en vivo (por código o nombre).
 * - Sección "Ir a": destinos diferenciados (usuarios, formularios, solicitudes).
 */
function GlobalSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) { setUsers([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await iamPorts.userRepository.list({ q });
        setUsers(r.slice(0, 5));
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  const go = (path: string) => { setOpen(false); setQ(''); navigate(path); };
  const term = q.trim();
  const enc = encodeURIComponent(term);

  return (
    <div ref={boxRef} className="hidden md:block relative flex-1 max-w-md">
      <div className="relative w-full">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="ftx-input-flat w-full pl-9 text-sm py-2"
          placeholder="Buscar usuarios, formularios, solicitudes..."
        />
      </div>
      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded overflow-hidden shadow-lg"
          style={{ background: 'var(--ftx-paper)', border: '1px solid var(--ftx-line-strong)' }}
        >
          {term.length >= 2 && (
            <div>
              <div className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-widest text-muted">
                usuarios
              </div>
              {loading && <div className="px-3 py-2 text-[11px] text-muted italic">Buscando...</div>}
              {!loading && users.length === 0 && (
                <div className="px-3 py-2 text-[11px] text-muted italic">Sin coincidencias</div>
              )}
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => go(`/users?q=${encodeURIComponent(u.employeeCode || u.fullName)}`)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-cream"
                >
                  <div className="size-6 rounded grid place-items-center font-display font-bold text-[9px] text-white shrink-0"
                       style={{ background: 'var(--ftx-brand)' }}>
                    {u.initials()}
                  </div>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block text-[12px] text-ink truncate">{u.fullName}</span>
                    <span className="block text-[10px] text-muted font-mono truncate">
                      {u.employeeCode || '—'} · {u.areaLabel || '—'}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
          <div style={{ borderTop: term.length >= 2 ? '1px solid var(--ftx-line)' : undefined }}>
            <div className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-widest text-muted">
              ir a
            </div>
            <SearchGo icon={<Users size={13} />}
                      label={term ? `Usuarios con "${term}"` : 'Usuarios'}
                      onClick={() => go(term ? `/users?q=${enc}` : '/users')} />
            <SearchGo icon={<FolderKanban size={13} />} label="Formularios" onClick={() => go('/forms')} />
            <SearchGo icon={<FileSpreadsheet size={13} />} label="Solicitudes" onClick={() => go('/submissions?scope=all')} />
          </div>
        </div>
      )}
    </div>
  );
}

function SearchGo({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] text-ink hover:bg-cream"
    >
      <span className="text-muted shrink-0">{icon}</span>
      {label}
    </button>
  );
}
