import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Inbox } from 'lucide-react';
import { AppShell } from '@/shared/ui/components/AppShell';
import { useSubmissionsStore } from '../stores/submissions.store';
import { STATUS_LABEL, type SubmissionStatus } from '../../domain/models/Submission';

const SCOPE_TABS: { id: 'mine' | 'assigned' | 'all'; label: string; hint: string }[] = [
  { id: 'mine',     label: 'Mis solicitudes', hint: 'Las que tú enviaste' },
  { id: 'assigned', label: 'Por aprobar',     hint: 'Asignadas a ti como aprobador' },
  { id: 'all',      label: 'Todas',           hint: 'Toda la organización' },
];

export default function SubmissionsListPage() {
  const { list, loading, scope, setScope, loadList } = useSubmissionsStore();
  const [searchParams] = useSearchParams();

  // Sincroniza el scope con el ?scope= de la URL (nav lateral, dashboard, etc.).
  useEffect(() => {
    const s = searchParams.get('scope');
    if (s === 'mine' || s === 'assigned' || s === 'all') setScope(s);
  }, [searchParams, setScope]);

  useEffect(() => { loadList(); }, [loadList, scope]);

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted">Tracking</div>
          <h1 className="font-display font-extrabold text-2xl mt-1 text-ink">
            Solicitudes
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Cada formulario enviado se convierte en una solicitud con su propio
            ticket y línea de tiempo de aprobación.
          </p>
        </div>
      </div>

      <div className="flex gap-1 mb-5 border-b border-line">
        {SCOPE_TABS.map((t) => {
          const active = scope === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setScope(t.id)}
              className={[
                'px-4 py-2 text-sm font-medium transition-colors relative',
                active ? 'text-ink' : 'text-muted hover:text-ink',
              ].join(' ')}
              style={{
                borderBottom: active ? '2px solid var(--ftx-brand)' : '2px solid transparent',
              }}
              title={t.hint}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="ftx-card overflow-hidden">
        {loading && <div className="p-6 text-muted text-sm">Cargando...</div>}
        {!loading && list.length === 0 && (
          <div className="p-12 text-center">
            <Inbox size={28} className="mx-auto text-line-strong" />
            <p className="text-sm text-muted mt-3">Sin solicitudes en esta vista.</p>
          </div>
        )}
        {!loading && list.length > 0 && (
          <ul className="divide-y divide-line">
            {list.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/submissions/${s.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-cream transition-colors"
                >
                  <span className="font-mono text-[11px] text-brand-deep bg-brand-tint border border-brand/20 px-2 py-0.5 rounded">
                    {s.ticketCode}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-ink truncate">
                        {s.formSnapshot?.title ?? `Formulario #${s.formId}`}
                      </span>
                      <StatusTag status={s.status} />
                    </div>
                    <p className="text-xs text-muted mt-0.5 truncate">
                      Enviada por {s.submitterLabel ?? `#${s.submitterId}`} · {formatDate(s.submittedAt)}
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex text-[11px] text-muted font-mono">
                    {s.stepExecutions.length} pasos
                  </span>
                  <ChevronRight size={16} className="text-line-strong" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}

function StatusTag({ status }: { status: SubmissionStatus }) {
  const colorClass = {
    APPROVED: '!text-success !border-success',
    REJECTED: '!text-brand !border-brand',
    RETURNED: '!text-warning !border-warning',
    IN_PROGRESS: '!text-info !border-info',
    DRAFT: '',
    CANCELED: '!text-muted',
  }[status];
  return <span className={`ftx-tag-flat ${colorClass}`}>{STATUS_LABEL[status]}</span>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}
