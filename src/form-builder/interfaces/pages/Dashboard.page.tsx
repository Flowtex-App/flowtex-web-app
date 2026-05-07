import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus, Sparkles, FileText, CheckCircle2, Zap } from 'lucide-react';
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
      {/* Hero */}
      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-6 mb-8">
        <div className="ftx-card p-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 size-44 ftx-stripe opacity-30 rotate-12" />
          <span className="ftx-tag ftx-tag-flame">workspace</span>
          <h1 className="font-display font-bold text-5xl md:text-6xl tracking-tight mt-3 leading-[0.95]">
            Hola, {user?.fullName.split(' ')[0] ?? 'colega'}.
            <br />
            <span className="bg-citron px-2 inline-block border-[3px] border-ink shadow-[4px_4px_0_0_var(--color-ink)] mt-1">
              Hagamos un formulario.
            </span>
          </h1>
          <p className="mt-5 text-ink/70 max-w-xl">
            Disena, publica y mide tus flujos sin esperar a un proveedor externo.
            La IA propone los campos a partir de tu descripcion.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/forms/new">
              <Button variant="primary" size="lg" icon={<Plus size={18} />}>Crear formulario</Button>
            </Link>
            <Link to="/forms">
              <Button size="lg" icon={<FileText size={18} />}>Ver biblioteca</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Tile color="bg-paper"  label="Formularios"  value={totals.all}        tag="todos" icon={<FileText size={18} />} />
          <Tile color="bg-citron" label="Publicados"  value={totals.published}  tag="vivos" icon={<CheckCircle2 size={18} />} />
          <Tile color="bg-blush"  label="Borradores"  value={totals.drafts}     tag="WIP" icon={<Zap size={18} />} />
          <Tile color="bg-mist"   label="Campos"      value={totals.fields}     tag="totales" icon={<Sparkles size={18} />} />
        </div>
      </section>

      {/* Recent */}
      <section className="ftx-card p-6">
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="ftx-tag ftx-tag-violet">biblioteca</span>
            <h2 className="font-display font-bold text-2xl mt-2">Formularios recientes</h2>
          </div>
          <Link to="/forms" className="font-display text-sm font-semibold underline underline-offset-4 decoration-flame decoration-[3px]">
            Ver todos <ArrowUpRight size={14} className="inline" />
          </Link>
        </div>

        {loading && <SkeletonRows />}

        {!loading && forms.length === 0 && (
          <div className="border-2 border-dashed border-ink/30 p-12 text-center">
            <p className="text-ink/60">Aun no tienes formularios. Crea el primero.</p>
            <Link to="/forms/new" className="inline-block mt-4">
              <Button variant="primary"><Plus size={16} /> Crear formulario</Button>
            </Link>
          </div>
        )}

        {!loading && forms.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.slice(0, 6).map((form) => (
              <Link
                key={form.id}
                to={`/forms/${form.id}`}
                className="ftx-card-cream p-5 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_var(--color-ink)] transition-transform block"
              >
                <div className="flex items-center justify-between">
                  <span className={`ftx-tag ${form.status === 'PUBLISHED' ? 'ftx-tag-mint' : form.status === 'ARCHIVED' ? 'ftx-tag-blush' : ''}`}>
                    {form.status.toLowerCase()}
                  </span>
                  <span className="font-mono text-[10px] text-ink/60">v{form.version}</span>
                </div>
                <h3 className="font-display font-bold text-lg mt-3 leading-tight">{form.title}</h3>
                <p className="text-sm text-ink/60 mt-1.5 line-clamp-2 min-h-[2.5em]">{form.description ?? '—'}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t-2 border-dashed border-ink/20">
                  <span className="text-xs font-mono uppercase tracking-wider text-ink/60">
                    {form.fields.length} campos
                  </span>
                  <ArrowUpRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function Tile({
  color,
  label,
  value,
  tag,
  icon,
}: {
  color: string;
  label: string;
  value: number;
  tag: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`${color} ftx-card p-5`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider">{label}</span>
        <div className="size-7 bg-ink text-paper border-2 border-ink flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="font-display font-bold text-4xl mt-2">{value}</div>
      <div className="text-xs text-ink/70">{tag}</div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="ftx-card-cream p-5 animate-pulse">
          <div className="h-4 w-1/3 bg-ink/10" />
          <div className="h-6 w-3/4 bg-ink/10 mt-3" />
          <div className="h-4 w-full bg-ink/10 mt-2" />
        </div>
      ))}
    </div>
  );
}
