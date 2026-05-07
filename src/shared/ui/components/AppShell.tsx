import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LogOut, Inbox, FileSpreadsheet, Search, BarChart3, FolderKanban,
  GitBranch, Users, ListChecks, ChevronDown, Bell, Menu, X, Layers,
} from 'lucide-react';
import { useAuthStore } from '@/iam/interfaces/stores/auth.store';

interface AppShellProps {
  children: ReactNode;
  /** When true, content area is `h-[calc(100vh-3rem)]` and clips overflow internally. */
  fitViewport?: boolean;
}

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
  children?: { to: string; label: string }[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Mi Bandeja', icon: <Inbox size={15} />, exact: true },
  { to: '/forms?status=ALL', label: 'Registro de Solicitudes', icon: <FileSpreadsheet size={15} /> },
  { to: '/forms?search=true', label: 'Consulta de Solicitudes', icon: <Search size={15} /> },
  { to: '/dashboard#reports', label: 'Reporte de formularios', icon: <BarChart3 size={15} /> },
  {
    to: '/forms', label: 'Gestion de formularios', icon: <FolderKanban size={15} />,
    children: [
      { to: '/forms', label: 'Biblioteca' },
      { to: '/forms/new', label: 'Creador de formularios' },
    ],
  },
  { to: '/workflows', label: 'Gestion de Workflows', icon: <GitBranch size={15} /> },
  { to: '/groups', label: 'Gestion de grupos', icon: <Users size={15} /> },
  { to: '/reports', label: 'Reporte de Solicitudes', icon: <BarChart3 size={15} /> },
  { to: '/orders', label: 'Seguimiento de Ordenes', icon: <ListChecks size={15} /> },
];

export function AppShell({ children, fitViewport = false }: AppShellProps) {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>('Gestion de formularios');

  const onSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  return (
    <div className="h-screen bg-bg flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={[
          'fixed lg:static inset-y-0 left-0 z-40 w-60 flex flex-col transition-transform',
          'bg-deep text-white border-r-2 border-ink',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="h-12 px-4 flex items-center gap-2 border-b border-white/10">
          <div className="size-7 bg-brand rounded grid place-items-center border border-ink">
            <Layers size={14} className="text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-extrabold text-sm tracking-tight">FLOWTEX</div>
            <div className="text-[9px] uppercase tracking-widest opacity-60">FormBuilder</div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden text-white/70 hover:text-white"
            aria-label="Cerrar menu"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-1.5">
          {navItems.map((item) => (
            item.children ? (
              <div key={item.label}>
                <button
                  onClick={() => setOpenGroup(openGroup === item.label ? null : item.label)}
                  className="ftx-sidebar-link w-full justify-between"
                >
                  <span className="flex items-center gap-2.5">{item.icon}<span>{item.label}</span></span>
                  <ChevronDown size={12} className={`transition-transform ${openGroup === item.label ? 'rotate-180' : ''}`} />
                </button>
                {openGroup === item.label && (
                  <div className="bg-black/20">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `ftx-sidebar-link pl-11 text-[12px] ${isActive ? 'active' : ''}`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `ftx-sidebar-link ${isActive ? 'active' : ''}`}
              >
                {item.icon}<span>{item.label}</span>
              </NavLink>
            )
          ))}
        </nav>

        <div className="px-4 py-2.5 border-t border-white/10 text-[10px] text-white/45 leading-relaxed">
          <div className="font-mono">v0.1.0</div>
          <div>Hitss Peru / Claro Peru</div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 bg-deep text-white flex items-center justify-between px-4 lg:px-5 border-b-2 border-ink shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-white/80 hover:text-white"
              aria-label="Abrir menu"
            >
              <Menu size={18} />
            </button>
            <div className="hidden md:flex items-center gap-2 text-[11px] opacity-70">
              <span>App 241</span>
              <span className="opacity-30">/</span>
              <span>Sesion activa</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="size-8 grid place-items-center text-white/80 hover:bg-white/10 rounded transition-colors"
              aria-label="Notificaciones"
            >
              <Bell size={16} />
            </button>
            {user && (
              <div className="flex items-center gap-2 pl-2.5 border-l border-white/15">
                <div className="size-7 bg-brand rounded grid place-items-center border border-ink font-display font-bold text-[10px] text-white">
                  {user.initials()}
                </div>
                <div className="hidden md:block leading-tight text-right">
                  <div className="text-[11px] font-medium">{user.fullName}</div>
                  <div className="text-[9px] text-white/55">@{user.username}</div>
                </div>
                <button
                  onClick={onSignOut}
                  className="size-7 grid place-items-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                  aria-label="Cerrar sesion"
                  title="Cerrar sesion"
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
