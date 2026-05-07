import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { FIELD_GROUPS, FIELD_TYPE_META, FIELD_TYPES, type FieldType } from '../../domain/models/FieldType';

export const PALETTE_DRAG_PREFIX = 'palette:';

interface PaletteItemProps {
  type: FieldType;
}

function PaletteItem({ type }: PaletteItemProps) {
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
      className={[
        'ftx-palette-item flex items-center gap-2.5 group',
        isDragging ? 'opacity-30' : '',
      ].join(' ')}
    >
      <div className="size-8 shrink-0 rounded-md bg-brand-tint border border-brand/20 grid place-items-center text-brand-deep font-semibold">
        {meta.glyph}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink truncate">{meta.label}</div>
        <div className="text-[11px] text-muted truncate">{meta.description}</div>
      </div>
      <GripVertical size={14} className="text-line-strong opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export function FieldPalette() {
  return (
    <div className="space-y-5">
      {FIELD_GROUPS.map((group) => {
        const types = FIELD_TYPES.filter((t) => FIELD_TYPE_META[t].group === group.id);
        return (
          <div key={group.id}>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2 px-1">
              {group.label}
            </div>
            <div className="space-y-1.5">
              {types.map((t) => <PaletteItem key={t} type={t} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
