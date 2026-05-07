import { useDraggable } from '@dnd-kit/core';
import { FIELD_GROUPS, FIELD_TYPE_META, FIELD_TYPES, type FieldType } from '../../domain/models/FieldType';

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
      title={`${meta.label} - ${meta.description}`}
      className={[
        'ftx-chip',
        isDragging ? 'opacity-30' : '',
      ].join(' ')}
    >
      <div className="font-display font-bold text-base text-brand">
        {meta.glyph}
      </div>
      <div className="text-[10px] font-medium leading-tight text-ink line-clamp-1">
        {meta.label.split(' ')[0]}
      </div>
    </div>
  );
}

export function FieldPalette() {
  return (
    <div className="space-y-3">
      {FIELD_GROUPS.map((group) => {
        const types = FIELD_TYPES.filter((t) => FIELD_TYPE_META[t].group === group.id);
        return (
          <div key={group.id}>
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted mb-1.5 px-0.5">
              {group.label}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {types.map((t) => <PaletteChip key={t} type={t} />)}
            </div>
          </div>
        );
      })}

      <div className="mt-3 pt-3 border-t-2 border-dashed border-line">
        <p className="text-[10px] text-muted leading-relaxed px-0.5">
          Arrastra al canvas o usa el asistente de IA para generar campos a partir del contexto.
        </p>
      </div>
    </div>
  );
}
