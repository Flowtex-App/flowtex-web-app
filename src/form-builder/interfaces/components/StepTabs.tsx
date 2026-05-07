import { Plus, Pencil, X } from 'lucide-react';
import { useState } from 'react';
import type { PageDef, PageId } from '../../domain/models/FormField';

interface Props {
  pages: PageDef[];
  active: PageId;
  counts: Record<PageId, number>;
  onChange: (next: PageId) => void;
  onAdd: () => void;
  onRemove?: (id: PageId) => void;
  onRename?: (id: PageId, label: string) => void;
  /** Optional override of the displayed labels (id → label). */
  labelOverride?: Record<PageId, string>;
}

export function StepTabs({
  pages, active, counts, onChange, onAdd, onRemove, onRename, labelOverride,
}: Props) {
  const [editingId, setEditingId] = useState<PageId | null>(null);
  const [editValue, setEditValue] = useState('');

  const startRename = (id: PageId, currentLabel: string) => {
    if (!onRename) return;
    setEditingId(id);
    setEditValue(currentLabel);
  };

  const commitRename = (id: PageId) => {
    if (onRename && editValue.trim()) {
      onRename(id, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      className="flex items-stretch gap-1 px-3 pt-2 overflow-x-auto"
      style={{
        background: 'var(--ftx-cream)',
        borderBottom: '1px solid var(--ftx-line)',
      }}
    >
      {pages.map((p) => {
        const isActive = active === p.id;
        const count = counts[p.id] ?? 0;
        const label = labelOverride?.[p.id] ?? p.label;
        return (
          <div key={p.id} className="relative group">
            {editingId === p.id ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => commitRename(p.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename(p.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                className="ftx-input-flat py-1 text-[12px] w-32"
              />
            ) : (
              <button
                onClick={() => onChange(p.id)}
                onDoubleClick={() => startRename(p.id, label)}
                className={['ftx-step-tab', isActive ? 'active' : ''].join(' ')}
                title="Doble clic para renombrar"
              >
                <span className="num">{String(p.index + 1).padStart(2, '0')}</span>
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[12px] font-medium">{label}</span>
                  <span
                    className="text-[9px] font-mono uppercase tracking-wider"
                    style={{ color: 'var(--ftx-muted)' }}
                  >
                    {count} {count === 1 ? 'campo' : 'campos'}
                  </span>
                </span>
              </button>
            )}

            {pages.length > 1 && onRemove && isActive && editingId !== p.id && (
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar ${label} y todos sus campos?`)) onRemove(p.id);
                }}
                className="absolute -top-1.5 -right-1.5 size-4 rounded-full grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'var(--ftx-brand)',
                  color: '#fff',
                  border: '1px solid var(--ftx-ink)',
                }}
                aria-label="Eliminar página"
                title="Eliminar página"
              >
                <X size={9} />
              </button>
            )}

            {isActive && onRename && editingId !== p.id && (
              <button
                onClick={() => startRename(p.id, label)}
                className="absolute top-1 right-1 ftx-icon-btn !w-4 !h-4 opacity-0 group-hover:opacity-100"
                aria-label="Renombrar"
                title="Renombrar página"
              >
                <Pencil size={9} />
              </button>
            )}
          </div>
        );
      })}

      <button
        onClick={onAdd}
        className="ftx-step-tab"
        title="Añadir página"
      >
        <Plus size={12} />
        <span className="text-[12px]">Página</span>
      </button>

      <div className="ml-auto flex items-center gap-2 pr-1">
        <span
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color: 'var(--ftx-muted)' }}
        >
          form pages
        </span>
        <div className="hidden md:flex items-center gap-1">
          {pages.map((p, i) => (
            <span key={p.id} className="flex items-center gap-1">
              <span
                className="size-1.5 rounded-full"
                style={{ background: p.id === active ? 'var(--ftx-brand)' : 'var(--ftx-line-strong)' }}
              />
              {i < pages.length - 1 && (
                <span className="w-3 h-px" style={{ background: 'var(--ftx-line-strong)' }} />
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
