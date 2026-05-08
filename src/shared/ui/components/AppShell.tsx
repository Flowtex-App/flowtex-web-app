import { type ReactNode, useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LogOut, Inbox, FileSpreadsheet, Search, FolderKanban,
  GitBranch, Users, ChevronDown, ChevronRight, Menu, X, Layers,
  Building2, Briefcase, BadgeCheck, Shield, ChevronUp, Plus,
} from 'lucide-react';
import { useAuthStore } from '@/iam/interfaces/stores/auth.store';
import { ThemeMenu } from '@/shared/ui/theme/ThemeMenu';

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
      { to: '/dashboard',           label: 'Mi cola',          icon: <Inbox size={14} />,           end: true },
      { to: '/forms?status=ALL',    label: 'Solicitudes',      icon: <FileSpreadsheet size={14} /> },
      { to: '/forms?search=true',   label: 'Buscar',           icon: <Search size={14} /> },
    ],
  },
  {
    id: 'diseno',
    title: 'Diseño',
    items: [
      { to: '/forms',     label: 'Formularios',  icon: <FolderKanban size={14} /> },
      { to: '/forms/new', label: 'Nuevo form',   icon: <Plus size={14} /> },
      { to: '/workflows', label: 'Workflows',    icon: <GitBranch size={14} /> },
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
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
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

  const onSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    navigate('/sign-in');
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
                        className={({ isActive }) => `ftx-nav-link ${isActive ? 'active' : ''}`}
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
                <button
                  onClick={onSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-[12px] text-ink hover:bg-cream"
                >
                  <LogOut size={13} className="text-brand" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}

        <div
          className="px-4 py-1.5 text-[9px] text-muted/70 font-mono"
          style={{ borderTop: '1px solid var(--ftx-line)' }}
        >
          v0.2.0 · claro perú
        </div>
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

            {/* Quick search hidden on small */}
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  className="ftx-input-flat w-full pl-9 text-sm py-2"
                  placeholder="Buscar formulario, ticket, usuario..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const v = (e.target as HTMLInputElement).value.trim();
                      if (v) navigate(`/users?q=${encodeURIComponent(v)}`);
                    }
                  }}
                />
              </div>
            </div>
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
