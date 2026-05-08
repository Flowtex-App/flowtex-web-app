import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Send, Pencil, FileText, Filter, FileEdit } from 'lucide-react';
import { AppShell } from '@/shared/ui/components/AppShell';
import { Button } from '@/shared/ui/components/Button';
import { useFormsStore } from '../stores/forms.store';

export default function FormListPage() {
  const { forms, loading, error, loadForms, publishForm, deleteForm } = useFormsStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('ALL');

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const visible = forms.filter((f) => {
    const matchesQ = [f.title, f.description ?? '', f.context ?? '']
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesS = statusFilter === 'ALL' || f.status === statusFilter;
    return matchesQ && matchesS;
  });

  const onPublish = async (id: number) => {
    if (!confirm('Publicar este formulario? Esta version sera la activa.')) return;
    await publishForm(id);
  };

  const onDelete = async (id: number) => {
    if (!confirm('Eliminar este formulario? Esta accion es irreversible.')) return;
    await deleteForm(id);
  };

  return (
    <AppShell>
      <header className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted">Gestion de formularios</div>
          <h1 className="font-display font-extrabold text-2xl mt-1 text-ink">Biblioteca de formularios</h1>
          <p className="text-sm text-muted mt-0.5">Crea, edita y publica los flujos del workspace.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/forms/new')} icon={<Plus size={15} />}>
          Crear formulario
        </Button>
      </header>

      <div className="ftx-card p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por titulo, descripcion o contexto..."
            className="ftx-input pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted" />
          <div className="flex border border-line-strong rounded-md overflow-hidden">
            {(['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={[
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  statusFilter === s ? 'bg-brand text-white' : 'bg-white text-ink-2 hover:bg-surface-2',
                ].join(' ')}
              >
                {s === 'ALL' ? 'Todos' : s.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-brand-soft border border-brand/30 text-brand-deep text-sm rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      <div className="ftx-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted">Cargando...</div>
        ) : visible.length === 0 ? (
          <div className="p-16 text-center">
            <FileText size={32} className="mx-auto text-line-strong" />
            <p className="text-sm text-muted mt-3">
              {forms.length === 0 ? 'No hay formularios todavia.' : 'Sin coincidencias.'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-surface-2 border-b border-line">
              <tr className="text-left">
                <Th>Titulo</Th>
                <Th>Estado</Th>
                <Th className="text-center">Campos</Th>
                <Th className="text-center">v</Th>
                <Th className="text-right pr-4">Acciones</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((form) => (
                <tr key={form.id} className="hover:bg-surface-2 transition-colors">
                  <td className="px-4 py-3.5">
                    <Link
                      to={`/forms/${form.id}`}
                      className="font-medium text-ink hover:text-brand"
                    >
                      {form.title}
                    </Link>
                    <p className="text-xs text-muted mt-0.5 line-clamp-1 max-w-md">
                      {form.description ?? '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusTag status={form.status} />
                  </td>
                  <td className="px-4 py-3.5 text-center text-sm text-ink-2">{form.fields.length}</td>
                  <td className="px-4 py-3.5 text-center text-sm text-ink-2">{form.version}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {form.status === 'PUBLISHED' && (
                        <button
                          onClick={() => navigate(`/forms/${form.id}/fill`)}
                          className="ftx-btn ftx-btn-primary !text-xs !py-1 !px-2"
                          title="Llenar y enviar"
                          aria-label="Llenar"
                        >
                          <FileEdit size={13} /> Llenar
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/forms/${form.id}`)}
                        className="ftx-btn ftx-btn-ghost p-1.5"
                        title="Editar"
                        aria-label="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      {form.status === 'DRAFT' && (
                        <button
                          onClick={() => onPublish(form.id)}
                          className="ftx-btn ftx-btn-ghost p-1.5 text-success hover:bg-success/10"
                          title="Publicar"
                          aria-label="Publicar"
                        >
                          <Send size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(form.id)}
                        className="ftx-btn ftx-btn-ghost p-1.5 hover:bg-brand-soft hover:text-brand"
                        title="Eliminar"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted ${className}`}>
      {children}
    </th>
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
