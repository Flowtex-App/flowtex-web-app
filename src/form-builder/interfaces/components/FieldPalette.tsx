import { Plus } from 'lucide-react';
import { FIELD_TYPES, FIELD_TYPE_META, type FieldType } from '../../domain/models/FieldType';

interface Props {
  onAdd: (type: FieldType) => void;
}

export function FieldPalette({ onAdd }: Props) {
  return (
    <div className="ftx-card-cream p-5">
      <span className="ftx-tag">paleta</span>
      <h3 className="font-display font-bold text-lg mt-2 mb-3">Anadir campo</h3>
      <div className="grid grid-cols-2 gap-2">
        {FIELD_TYPES.map((type) => {
          const meta = FIELD_TYPE_META[type];
          return (
            <button
              key={type}
              onClick={() => onAdd(type)}
              className="ftx-btn ftx-btn-ghost border-2 border-ink/40 hover:border-ink hover:bg-paper hover:shadow-[3px_3px_0_0_var(--color-ink)] text-left flex items-center gap-2 px-2.5 py-2 text-sm"
            >
              <span className="size-7 bg-paper border-2 border-ink flex items-center justify-center text-xs font-mono">
                {meta.emoji}
              </span>
              <span className="flex-1 truncate">{meta.label}</span>
              <Plus size={14} className="opacity-50" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
