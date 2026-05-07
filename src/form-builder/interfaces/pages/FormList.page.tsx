import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Send, Pencil, FileText } from 'lucide-react';
import { AppShell } from '@/shared/ui/components/AppShell';
import { Button } from '@/shared/ui/components/Button';
import { useFormsStore } from '../stores/forms.store';

const statusColor: Record<string, string> = {
  DRAFT: 'ftx-tag-blush',
  PUBLISHED: 'ftx-tag-mint',
  ARCHIVED: 'ftx-tag',
};

export default function FormListPage() {
  const { forms, loading, error, loadForms, publishForm, deleteForm } = useFormsStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const visible = forms.filter((f) =>
    [f.title, f.description ?? '', f.context ?? '']
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const onPublish = async (id: number) => {
    if (!confirm('Publicar este formulario?')) return;
    await publishForm(id);
  };

  const onDelete = async (id: number) => {
    if (!confirm('Eliminar este formulario? Esta accion es irreversible.')) return;
    await deleteForm(id);
  };

  return (
    <AppShell>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <span className="ftx-tag ftx-tag-violet">biblioteca</span>
          <h1 className="font-display font-bold text-4xl mt-2">Todos los formularios</h1>
          <p className="text-ink/60 mt-1">Gestiona, publica y elimina los flujos del workspace.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="ftx-input pl-9 w-64"
            />
          </div>
          <Button variant="primary" onClick={() => navigate('/forms/new')} icon={<Plus size={16} />}>
            Crear
          </Button>
        </div>
      </header>

      {error && (
        <div className="border-[3px] border-flame bg-blush p-3 mb-4 font-medium">{error}</div>
      )}

      {loading ? (
        <div className="text-ink/50">Cargando...</div>
      ) : visible.length === 0 ? (
        <div className="ftx-card p-16 text-center">
          <FileText size={32} className="mx-auto text-ink/30" />
          <p className="mt-3 text-ink/60">No hay formularios que coincidan.</p>
        </div>
      ) : (
        <div className="ftx-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-cream border-b-[3px] border-ink">
              <tr className="text-left">
                <Th>Titulo</Th>
                <Th>Estado</Th>
                <Th>Campos</Th>
                <Th>v</Th>
                <Th className="text-right pr-4">Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((form, idx) => (
                <tr
                  key={form.id}
                  className={[
                    'border-b border-ink/10 hover:bg-cream/50',
                    idx === visible.length - 1 ? 'border-b-0' : '',
                  ].join(' ')}
                >
                  <td className="px-4 py-4">
                    <Link to={`/forms/${form.id}`} className="font-display font-semibold hover:underline decoration-flame decoration-[2px] underline-offset-4">
                      {form.title}
                    </Link>
                    <p className="text-xs text-ink/60 mt-0.5 line-clamp-1 max-w-md">
                      {form.description ?? '—'}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`ftx-tag ${statusColor[form.status] ?? ''}`}>
                      {form.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono text-sm">{form.fields.length}</td>
                  <td className="px-4 py-4 font-mono text-sm">{form.version}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/forms/${form.id}`)}
                        className="ftx-btn ftx-btn-ghost size-9 p-0"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      {form.status === 'DRAFT' && (
                        <button
                          onClick={() => onPublish(form.id)}
                          className="ftx-btn ftx-btn-citron size-9 p-0"
                          title="Publicar"
                        >
                          <Send size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(form.id)}
                        className="ftx-btn size-9 p-0 hover:bg-flame hover:text-paper"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-[11px] font-mono uppercase tracking-wider text-ink/70 ${className}`}>
      {children}
    </th>
  );
}
