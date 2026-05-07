import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, GitBranch, ArrowUpRight } from 'lucide-react';
import { AppShell } from '@/shared/ui/components/AppShell';
import { Button } from '@/shared/ui/components/Button';
import { useWorkflowStore } from '../stores/workflow.store';
import { STEP_MODE_META } from '../../domain/models/Workflow';

export default function WorkflowListPage() {
  const { workflows, loading, error, loadList } = useWorkflowStore();

  useEffect(() => { loadList(); }, [loadList]);

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            workflow editor · biblioteca
          </div>
          <h1 className="font-display font-extrabold text-3xl text-ink mt-1">
            Workflows
          </h1>
          <p className="text-sm text-ink-2 mt-1.5 max-w-2xl">
            Define el flujo de aprobación: pasos, roles, SLAs y secciones que se inyectan al
            formulario cuando ese paso está activo. Cada formulario puede enlazarse a uno.
          </p>
        </div>
        <Link to="/workflows/new">
          <Button variant="primary" icon={<Plus size={14} />}>
            Nuevo workflow
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 text-sm rounded p-3 font-medium"
             style={{ background: 'var(--ftx-brand-soft)', border: '1px solid var(--ftx-brand)', color: 'var(--ftx-brand-deep)' }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="text-muted text-sm">Cargando...</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((w) => (
          <Link
            key={w.id}
            to={`/workflows/${w.id}`}
            className="ftx-tile p-4 group block"
          >
            <div className="flex items-start gap-3">
              <div
                className="size-9 rounded grid place-items-center"
                style={{ background: 'var(--ftx-brand-tint)', color: 'var(--ftx-brand)' }}
              >
                <GitBranch size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-base text-ink truncate">
                    {w.name}
                  </h3>
                  <span
                    className={`ftx-tag-flat ${
                      w.status === 'PUBLISHED'
                        ? '!text-success !border-success'
                        : '!text-warning !border-warning'
                    }`}
                  >
                    {w.status.toLowerCase()}
                  </span>
                </div>
                <p className="text-[12px] text-ink-2 mt-1.5 line-clamp-2">
                  {w.description || 'Sin descripción'}
                </p>
              </div>
              <ArrowUpRight
                size={14}
                className="text-muted group-hover:text-brand transition-colors shrink-0"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[11px]">
              <span className="font-mono text-muted">
                {w.steps.length} {w.steps.length === 1 ? 'paso' : 'pasos'}
              </span>
              <span className="font-mono text-muted">
                {w.steps.reduce((acc, s) => acc + s.sections.length, 0)} secciones
              </span>
            </div>

            <div className="mt-3 flex items-center gap-1">
              {w.steps.map((s, i) => (
                <div key={i} className="flex items-center gap-1 flex-1 min-w-0">
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded truncate"
                    style={{
                      background: 'var(--ftx-cream)',
                      border: '1px solid var(--ftx-line)',
                      color: 'var(--ftx-ink-2)',
                    }}
                    title={`${s.label} · ${STEP_MODE_META[s.mode].label} · ${s.slaHours}h`}
                  >
                    {s.label}
                  </span>
                  {i < w.steps.length - 1 && <span className="text-muted">→</span>}
                </div>
              ))}
            </div>
          </Link>
        ))}

        {!loading && workflows.length === 0 && (
          <div className="col-span-full ftx-drop-zone p-8 text-center text-muted">
            <p className="font-display font-bold text-base text-ink">Sin workflows aún</p>
            <p className="text-sm mt-1">Crea el primero para empezar a enlazar formularios.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
