import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, Plus, FileText, CheckCircle2, FileEdit, Layers, Clock, ChevronRight,
} from 'lucide-react';
import { AppShell } from '@/shared/ui/components/AppShell';
import { Button } from '@/shared/ui/components/Button';
import { useFormsStore } from '../stores/forms.store';
import { useAuthStore } from '@/iam/interfaces/stores/auth.store';

export default function DashboardPage() {
  const { forms, loading, loadForms } = useFormsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const totals = {
    all: forms.length,
    published: forms.filter((f) => f.status === 'PUBLISHED').length,
    drafts: forms.filter((f) => f.status === 'DRAFT').length,
    fields: forms.reduce((acc, f) => acc + f.fields.length, 0),
  };

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted">Mi bandeja</div>
          <h1 className="font-display font-extrabold text-2xl mt-1 text-ink">
            Hola, {user?.fullName.split(' ')[0] ?? 'colega'}
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Resumen de tu actividad y formularios recientes.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/forms"><Button icon={<FileText size={15} />}>Ver biblioteca</Button></Link>
          <Link to="/forms/new"><Button variant="primary" icon={<Plus size={15} />}>Crear formulario</Button></Link>
        </div>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Tile icon={<FileText size={18} />} label="Formularios" value={totals.all} hint="todos" tone="neutral" />
        <Tile icon={<CheckCircle2 size={18} />} label="Publicados" value={totals.published} hint="vivos en produccion" tone="success" />
        <Tile icon={<FileEdit size={18} />} label="Borradores" value={totals.drafts} hint="en construccion" tone="warn" />
        <Tile icon={<Layers size={18} />} label="Campos" value={totals.fields} hint="totales" tone="brand" />
      </section>

      <section className="grid lg:grid-cols-[1fr_360px] gap-5">
        <div className="ftx-card">
          <div className="px-5 py-3.5 border-b border-line flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-base text-ink">Formularios recientes</h2>
              <p className="text-xs text-muted">Ultimos creados o editados.</p>
            </div>
            <Link to="/forms" className="text-sm text-brand hover:text-brand-dark font-medium flex items-center gap-1">
              Ver todos <ArrowUpRight size={14} />
            </Link>
          </div>

          {loading && <SkeletonRows />}
          {!loading && forms.length === 0 && (
            <div className="p-12 text-center">
              <FileText size={28} className="mx-auto text-line-strong" />
              <p className="text-sm text-muted mt-3">Aun no tienes formularios.</p>
              <Link to="/forms/new" className="inline-block mt-4">
                <Button variant="primary" icon={<Plus size={14} />}>Crear el primero</Button>
              </Link>
            </div>
          )}
          {!loading && forms.length > 0 && (
            <ul className="divide-y divide-line">
              {forms.slice(0, 6).map((form) => (
                <li key={form.id}>
                  <Link
                    to={`/forms/${form.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2 transition-colors"
                  >
                    <div className="size-10 rounded-md bg-brand-tint border border-brand/20 grid place-items-center text-brand-deep">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-ink truncate">{form.title}</span>
                        <StatusTag status={form.status} />
                        <span className="ftx-tag ftx-tag-muted">v{form.version}</span>
                      </div>
                      <p className="text-xs text-muted mt-0.5 truncate">
                        {form.description ?? '—'}
                      </p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end text-right">
                      <span className="text-xs text-muted">{form.fields.length} campos</span>
                    </div>
                    <ChevronRight size={16} className="text-line-strong" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="space-y-5">
          <div className="ftx-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-ink">Acciones rapidas</h3>
            </div>
            <div className="space-y-2">
              <QuickAction to="/forms/new" icon={<Plus size={14} />} label="Crear formulario" />
              <QuickAction to="/forms" icon={<FileText size={14} />} label="Ver biblioteca" />
              <QuickAction to="/submissions?scope=assigned" icon={<Clock size={14} />} label="Solicitudes pendientes" />
            </div>
          </div>

          <div className="ftx-card p-5">
            <h3 className="font-display font-bold text-sm text-ink mb-3">Estado del sistema</h3>
            <div className="space-y-2.5 text-sm">
              <Row label="Disponibilidad" value="99.7%" tone="success" />
              <Row label="Tiempo medio API" value="248 ms" tone="success" />
              <Row label="Workflows activos" value="3" tone="info" />
              <Row label="Defectos sprint" value="3.1%" tone="success" />
            </div>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}

function Tile({
  icon, label, value, hint, tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  tone: 'neutral' | 'success' | 'warn' | 'brand';
}) {
  const toneClass: Record<string, string> = {
    neutral: 'bg-surface text-ink-2',
    success: 'bg-success/10 text-success',
    warn:    'bg-warning/10 text-warning',
    brand:   'bg-brand-tint text-brand-deep',
  };
  return (
    <div className="ftx-card p-4">
      <div className="flex items-center justify-between">
        <div className={`size-9 rounded-md grid place-items-center ${toneClass[tone]}`}>
          {icon}
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted">{label}</span>
      </div>
      <div className="mt-3">
        <div className="font-display font-extrabold text-3xl text-ink">{value}</div>
        <div className="text-xs text-muted">{hint}</div>
      </div>
    </div>
  );
}

function StatusTag({ status }: { status: string }) {
  const map: Record<string, string> = {
    PUBLISHED: 'ftx-tag-success',
    DRAFT:     'ftx-tag-warn',
    ARCHIVED:  'ftx-tag-muted',
  };
  return <span className={`ftx-tag ${map[status] ?? ''}`}>{status.toLowerCase()}</span>;
}

function QuickAction({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-surface-2 border border-transparent hover:border-line text-sm text-ink transition-colors"
    >
      <span className="text-brand">{icon}</span>
      <span className="flex-1">{label}</span>
      <ChevronRight size={14} className="text-line-strong" />
    </Link>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: 'success' | 'info' | 'warn' }) {
  const dot: Record<string, string> = {
    success: 'bg-success',
    info: 'bg-info',
    warn: 'bg-warning',
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted flex items-center gap-2">
        <span className={`size-1.5 rounded-full ${dot[tone]}`} />
        {label}
      </span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function SkeletonRows() {
  return (
    <ul className="divide-y divide-line">
      {[1, 2, 3].map((i) => (
        <li key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
          <div className="size-10 rounded-md bg-line" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-line rounded w-1/3" />
            <div className="h-2.5 bg-line rounded w-2/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}
