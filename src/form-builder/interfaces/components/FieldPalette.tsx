import { useMemo, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ChevronDown, Search } from 'lucide-react';
import {
  FIELD_GROUPS, FIELD_TYPE_META, FIELD_TYPES, type FieldGroup, type FieldType,
} from '../../domain/models/FieldType';

export const PALETTE_DRAG_PREFIX = 'palette:';

function PaletteChip({ type }: { type: FieldType }) {
  const meta = FIELD_TYPE_META[type];
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${PALETTE_DRAG_PREFIX}${type}`,
    data: { source: 'palette', fieldType: type },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={`${meta.label} — ${meta.description}`}
      className={['ftx-chip', isDragging ? 'opacity-30' : ''].join(' ')}
    >
      <span className="ftx-chip-glyph">{meta.glyph}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium text-ink leading-tight truncate">
          {meta.label}
        </div>
        <div className="text-[9px] text-muted leading-tight truncate font-mono">
          {meta.description}
        </div>
      </div>
    </div>
  );
}

interface GroupSectionProps {
  group: { id: FieldGroup; label: string; hint: string };
  types: FieldType[];
  open: boolean;
  onToggle: () => void;
}

function GroupSection({ group, types, open, onToggle }: GroupSectionProps) {
  return (
    <section className="border-b border-line">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-cream transition-colors"
      >
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
            {group.id}
          </span>
          <span className="font-display font-bold text-[12px] text-ink uppercase tracking-wider">
            {group.label}
          </span>
        </div>
        <ChevronDown
          size={12}
          className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-2.5 pb-2.5 pt-0.5 space-y-1">
          <p className="text-[9px] text-muted px-1 mb-1.5 font-mono">{group.hint}</p>
          {types.map((t) => <PaletteChip key={t} type={t} />)}
        </div>
      )}
    </section>
  );
}

export function FieldPalette() {
  const [query, setQuery] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<FieldGroup, boolean>>({
    LAYOUT: true,
    AUTO: true,
    TEXTO: true,
    NUMERICO: false,
    SELECCION: false,
    TIEMPO: false,
    AVANZADO: false,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return FIELD_TYPES.filter((t) => {
      const m = FIELD_TYPE_META[t];
      return (
        m.label.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        t.toLowerCase().includes(q)
      );
    });
  }, [query]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-line bg-paper">
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar elemento..."
            className="ftx-input-flat text-[11px] py-1 pl-7 pr-2"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered ? (
          <div className="px-2.5 py-2 space-y-1">
            {filtered.length === 0 ? (
              <p className="text-[11px] text-muted text-center py-4">
                Nada coincide con "<span className="font-mono">{query}</span>"
              </p>
            ) : (
              filtered.map((t) => <PaletteChip key={t} type={t} />)
            )}
          </div>
        ) : (
          FIELD_GROUPS.map((group) => {
            const types = FIELD_TYPES.filter((t) => FIELD_TYPE_META[t].group === group.id);
            return (
              <GroupSection
                key={group.id}
                group={group}
                types={types}
                open={openGroups[group.id]}
                onToggle={() =>
                  setOpenGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))
                }
              />
            );
          })
        )}
      </div>

      <div className="px-3 py-2 border-t border-line bg-cream text-[10px] text-muted leading-snug">
        Arrastra al canvas. Tambien puedes pedir sugerencias al{' '}
        <span className="font-mono text-ink">asistente IA</span>.
      </div>
    </div>
  );
}
