import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LogOut, Inbox, FileSpreadsheet, Search, BarChart3, FolderKanban,
  GitBranch, Users, ListChecks, ChevronDown, ChevronRight, Bell, Menu, X, Layers,
} from 'lucide-react';
import { useAuthStore } from '@/iam/interfaces/stores/auth.store';
import { ThemeMenu } from '@/shared/ui/theme/ThemeMenu';

interface AppShellProps {
  children: ReactNode;
  /** When true, content area fills the viewport and clips overflow internally. */
  fitViewport?: boolean;
}

interface NavLeaf {
  to: string;
  label: string;
  icon?: ReactNode;
  end?: boolean;
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
      { to: '/forms/new', label: 'Nuevo form',   icon: <FileSpreadsheet size={14} /> },
      { to: '/workflows', label: 'Workflows',    icon: <GitBranch size={14} /> },
    ],
  },
  {
    id: 'gestion',
    title: 'Gestión',
    items: [
      { to: '/groups',  label: 'Grupos',                icon: <Users size={14} /> },
      { to: '/reports', label: 'Reportes',              icon: <BarChart3 size={14} /> },
      { to: '/orders',  label: 'Seguimiento órdenes',   icon: <ListChecks size={14} /> },
    ],
  },
];

export function AppShell({ children, fitViewport = false }: AppShellProps) {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const onSignOut = async () => {
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
          className="h-12 px-4 flex items-center gap-2.5 shrink-0"
          style={{ borderBottom: '1px solid var(--ftx-line)' }}
        >
          <div
            className="size-7 rounded grid place-items-center"
            style={{ background: 'var(--ftx-brand)' }}
          >
            <Layers size={14} className="text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-extrabold text-[14px] tracking-tight text-ink">
              FLOWTEX
            </div>
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted">
              hitss / claro
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
        <nav className="flex-1 overflow-y-auto py-1 text-ink-2">
          {navGroups.map((group) => {
            const isCollapsed = !!collapsedGroups[group.id];
            return (
              <div key={group.id} className="pb-1">
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

        {/* Footer */}
        <div
          className="px-4 py-2.5 text-[10px] text-muted leading-relaxed"
          style={{ borderTop: '1px solid var(--ftx-line)' }}
        >
          <div className="font-mono">v0.2.0</div>
          <div>Hitss Perú · Claro Perú</div>
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
          className="h-12 flex items-center justify-between px-4 lg:px-5 shrink-0"
          style={{
            background: 'var(--ftx-paper)',
            borderBottom: '1px solid var(--ftx-line)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden ftx-icon-btn"
              aria-label="Abrir menu"
            >
              <Menu size={16} />
            </button>
            <div className="hidden md:flex items-center gap-2 text-[11px] text-muted font-mono">
              <span>app.241</span>
              <span style={{ color: 'var(--ftx-line-strong)' }}>/</span>
              <span style={{ color: 'var(--ftx-success)' }}>● activo</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeMenu />

            <button
              className="ftx-icon-btn"
              aria-label="Notificaciones"
              title="Notificaciones"
            >
              <Bell size={14} />
            </button>

            {user && (
              <div
                className="flex items-center gap-2 pl-2.5 ml-1"
                style={{ borderLeft: '1px solid var(--ftx-line)' }}
              >
                <div
                  className="size-7 rounded grid place-items-center font-display font-bold text-[10px] text-white"
                  style={{ background: 'var(--ftx-brand)' }}
                >
                  {user.initials()}
                </div>
                <div className="hidden md:block leading-tight text-right">
                  <div className="text-[12px] font-medium text-ink">{user.fullName}</div>
                  <div className="text-[10px] text-muted font-mono">@{user.username}</div>
                </div>
                <button
                  onClick={onSignOut}
                  className="ftx-icon-btn"
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                >
                  <LogOut size={13} />
                </button>
              </div>
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
