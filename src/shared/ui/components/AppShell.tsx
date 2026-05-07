import { type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Sparkles, LayoutDashboard, FileText, Plus } from 'lucide-react';
import { useAuthStore } from '@/iam/interfaces/stores/auth.store';

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { to: '/dashboard', label: 'Inicio', icon: <LayoutDashboard size={18} /> },
  { to: '/forms', label: 'Formularios', icon: <FileText size={18} /> },
  { to: '/forms/new', label: 'Crear', icon: <Plus size={18} /> },
];

export function AppShell({ children }: AppShellProps) {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const onSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b-[3px] border-ink bg-paper sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="size-9 bg-flame border-[3px] border-ink shadow-[3px_3px_0_0_var(--color-ink)] flex items-center justify-center">
              <Sparkles size={18} strokeWidth={2.5} className="text-paper" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-lg tracking-tight">FLOWTEX</div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-ink/60">FormBuilder · Hitss</div>
            </div>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'px-3 py-2 font-display font-medium text-sm flex items-center gap-2 border-2',
                    isActive
                      ? 'border-ink bg-citron'
                      : 'border-transparent hover:border-ink hover:bg-cream',
                  ].join(' ')
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden md:flex items-center gap-2.5">
                <div className="size-9 bg-violet text-paper border-[3px] border-ink flex items-center justify-center font-display font-bold text-sm">
                  {user.initials()}
                </div>
                <div className="leading-tight text-right">
                  <div className="text-sm font-medium">{user.fullName}</div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-ink/60">@{user.username}</div>
                </div>
              </div>
            )}
            <button
              onClick={onSignOut}
              className="ftx-btn ftx-btn-ink size-10 p-0"
              aria-label="Cerrar sesion"
              title="Cerrar sesion"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-[1400px] mx-auto px-6 py-8">{children}</div>
      </main>

      <footer className="border-t-[3px] border-ink bg-cream">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between text-xs font-mono text-ink/60">
          <span>FLOWTEX · 2026 · Hitss Peru / Claro Peru</span>
          <span className="flex items-center gap-2">
            <span className="size-2 bg-mint border border-ink" />
            v0.1.0 · ISO 12207 · ISO 27001
          </span>
        </div>
      </footer>
    </div>
  );
}
