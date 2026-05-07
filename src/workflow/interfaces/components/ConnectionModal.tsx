import { useEffect, useState } from 'react';
import { X, Link2 } from 'lucide-react';
import { CONDITION_META, type ConditionKind } from '../../domain/models/Workflow';

interface Props {
  open: boolean;
  fromLabel: string;
  toLabel: string;
  /** When editing an existing edge, prefill values. */
  initial?: {
    conditionKind: ConditionKind;
    label: string;
    config: string | null;
  };
  onSubmit: (payload: { conditionKind: ConditionKind; label: string; config: string | null }) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const CONDITIONS: ConditionKind[] = ['ALWAYS', 'ON_APPROVE', 'ON_REJECT', 'ON_RETURN', 'CUSTOM'];

export function ConnectionModal({
  open, fromLabel, toLabel, initial, onSubmit, onCancel, onDelete,
}: Props) {
  const [conditionKind, setConditionKind] = useState<ConditionKind>('ALWAYS');
  const [label, setLabel] = useState('');
  const [config, setConfig] = useState('');

  useEffect(() => {
    if (open) {
      setConditionKind(initial?.conditionKind ?? 'ALWAYS');
      setLabel(initial?.label ?? '');
      setConfig(initial?.config ?? '');
    }
  }, [open, initial]);

  if (!open) return null;

  const submit = () => {
    onSubmit({
      conditionKind,
      label: label.trim(),
      config: conditionKind === 'CUSTOM' ? (config.trim() || null) : null,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(0,0,0,0.45)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ftx-card overflow-hidden"
        style={{ background: 'var(--ftx-paper)', width: 'min(480px, calc(100vw - 2rem))' }}
      >
        <header
          className="px-4 py-3 flex items-center gap-2"
          style={{
            background: 'var(--ftx-cream)',
            borderBottom: '2px solid var(--ftx-ink)',
          }}
        >
          <div
            className="size-8 rounded grid place-items-center"
            style={{ background: 'var(--ftx-brand)', color: '#fff' }}
          >
            <Link2 size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
              configurar transición
            </div>
            <div className="text-[13px] font-display font-bold text-ink truncate">
              {fromLabel} <span className="text-muted">→</span> {toLabel}
            </div>
          </div>
          <button
            onClick={onCancel}
            className="ftx-icon-btn"
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        </header>

        <div className="p-4 space-y-3">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1.5">
              ¿Cuándo se toma este camino?
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {CONDITIONS.map((c) => {
                const meta = CONDITION_META[c];
                const active = conditionKind === c;
                return (
                  <button
                    key={c}
                    onClick={() => setConditionKind(c)}
                    className={[
                      'flex items-center gap-2.5 px-3 py-2 border rounded text-left transition-colors',
                      active ? 'border-brand bg-brand-tint' : 'border-line hover:border-steel hover:bg-cream',
                    ].join(' ')}
                  >
                    <span
                      className="size-2.5 rounded-full shrink-0"
                      style={{ background: meta.color }}
                    />
                    <span className="flex-1">
                      <span className="text-[12px] font-medium text-ink">{meta.label}</span>
                      <span className="block text-[10px] text-muted">{meta.hint}</span>
                    </span>
                    {active && (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-brand">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="text-[11px] font-medium text-ink-2">Etiqueta (opcional)</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej. Aprobado por TI"
              className="ftx-input-flat mt-1 text-[13px]"
            />
            <span className="block text-[10px] text-muted mt-1">
              Se muestra junto a la flecha en el diagrama.
            </span>
          </label>

          {conditionKind === 'CUSTOM' && (
            <label className="block">
              <span className="text-[11px] font-medium text-ink-2">Expresión personalizada</span>
              <textarea
                value={config}
                onChange={(e) => setConfig(e.target.value)}
                rows={2}
                placeholder='monto > 5000 && area === "TI"'
                className="ftx-input-flat font-mono text-[12px] mt-1 resize-y"
              />
              <span className="block text-[10px] text-muted mt-1">
                Sintaxis a definir en el motor de reglas. Por ahora se guarda como texto.
              </span>
            </label>
          )}
        </div>

        <footer
          className="px-4 py-3 flex items-center gap-2"
          style={{ background: 'var(--ftx-cream)', borderTop: '1px solid var(--ftx-line)' }}
        >
          {onDelete && (
            <button
              onClick={() => {
                if (confirm('¿Eliminar esta transición?')) onDelete();
              }}
              className="ftx-btn ftx-btn-danger !text-xs"
            >
              Eliminar
            </button>
          )}
          <div className="flex-1" />
          <button onClick={onCancel} className="ftx-btn ftx-btn-ghost !text-xs">
            Cancelar
          </button>
          <button onClick={submit} className="ftx-btn ftx-btn-primary !text-xs">
            Guardar transición
          </button>
        </footer>
      </div>
    </div>
  );
}
