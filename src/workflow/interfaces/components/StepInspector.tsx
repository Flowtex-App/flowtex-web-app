import { Trash2, Plus, ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';
import {
  type WorkflowStep, type WorkflowStepSection, type SectionKind, type StepMode, type StepColor,
  DEFAULT_ROLES, SECTION_KIND_META, STEP_MODE_META, STEP_COLORS, colorMeta, newSection,
} from '../../domain/models/Workflow';

interface Props {
  step: WorkflowStep | null;
  onChange: (next: WorkflowStep) => void;
  onDelete: () => void;
}

export function StepInspector({ step, onChange, onDelete }: Props) {
  if (!step) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center">
        <div
          className="size-10 rounded border-2 border-dashed grid place-items-center text-muted text-lg font-mono mb-3"
          style={{ borderColor: 'var(--ftx-line-strong)' }}
        >
          ∅
        </div>
        <p className="font-display font-bold text-sm text-ink">Sin nodo seleccionado</p>
        <p className="text-[11px] text-muted mt-1.5 leading-relaxed max-w-[220px]">
          Click en cualquier nodo del canvas para editar sus propiedades. Doble-click en una flecha para configurar la transición.
        </p>
        <div className="mt-4 px-3 py-2 bg-cream border border-line rounded text-[10px] text-muted font-mono leading-relaxed text-left">
          <div>· arrastrar handle ↓ para conectar</div>
          <div>· click derecho para eliminar</div>
          <div>· wheel para zoom</div>
        </div>
      </div>
    );
  }

  const update = (patch: Partial<WorkflowStep>) => onChange({ ...step, ...patch });

  const addSection = (kind: SectionKind) => {
    update({ sections: [...step.sections, newSection(kind, step.sections.length)] });
  };

  const updateSection = (sIdx: number, patch: Partial<WorkflowStepSection>) => {
    update({ sections: step.sections.map((s, i) => (i === sIdx ? { ...s, ...patch } : s)) });
  };

  const removeSection = (sIdx: number) => {
    update({
      sections: step.sections.filter((_, i) => i !== sIdx).map((s, i) => ({ ...s, position: i })),
    });
  };

  const cm = colorMeta(step.color);

  return (
    <div className="h-full flex flex-col">
      <div
        className="px-4 py-3"
        style={{
          background: cm.tint,
          borderBottom: '1px solid var(--ftx-line)',
          borderLeft: `4px solid ${cm.strong}`,
        }}
      >
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
          step · {step.id ? `#${step.id}` : 'no guardado'}
        </div>
        <div className="text-[14px] font-display font-bold text-ink mt-0.5 truncate">
          {step.label}
        </div>
        <div className="mt-1.5 flex items-center gap-1 flex-wrap">
          <span className="ftx-tag-flat">{step.role.replace('ROLE_', '')}</span>
          <span className="ftx-tag-flat">{STEP_MODE_META[step.mode].label}</span>
          <span className="ftx-tag-flat">{step.slaHours}h</span>
          {step.sections.length > 0 && (
            <span className="ftx-tag-flat !text-info !border-info">
              {step.sections.length} {step.sections.length === 1 ? 'sección' : 'secciones'}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="ftx-inspector-section pb-2">
          <h4 className="ftx-inspector-title">Identificación</h4>
          <div className="ftx-inspector-row">
            <label>Etiqueta</label>
            <input
              value={step.label}
              onChange={(e) => update({ label: e.target.value })}
              className="ftx-input-flat"
            />
          </div>
          <div className="ftx-inspector-row">
            <label>Rol</label>
            <select
              value={step.role}
              onChange={(e) => update({ role: e.target.value })}
              className="ftx-input-flat"
            >
              {DEFAULT_ROLES.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="ftx-inspector-row">
            <label>SLA (h)</label>
            <input
              type="number"
              min={1}
              max={720}
              value={step.slaHours}
              onChange={(e) => update({ slaHours: Math.max(1, Number(e.target.value)) })}
              className="ftx-input-flat font-mono"
            />
          </div>
          <div className="ftx-inspector-row">
            <label>Modo</label>
            <div className="ftx-width-pill w-full">
              {(['SEQUENTIAL', 'PARALLEL', 'MAJORITY'] as StepMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => update({ mode: m })}
                  className={['flex-1 !text-[10px]', step.mode === m ? 'is-active' : ''].join(' ')}
                  title={STEP_MODE_META[m].description}
                >
                  {STEP_MODE_META[m].label}
                </button>
              ))}
            </div>
          </div>
          <div className="ftx-inspector-row">
            <label>Detalle</label>
            <textarea
              value={step.description ?? ''}
              onChange={(e) => update({ description: e.target.value })}
              rows={2}
              className="ftx-input-flat resize-y"
              placeholder="Cómo opera este paso, qué se valida..."
            />
          </div>
        </div>

        <div className="ftx-inspector-section pb-3">
          <h4 className="ftx-inspector-title">Color del paso</h4>
          <div className="px-3 pb-2 grid grid-cols-3 gap-1.5">
            {STEP_COLORS.map((c) => {
              const isActive = (step.color ?? 'slate') === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => update({ color: (c.id === 'slate' ? null : c.id) as StepColor | null })}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded border transition-colors"
                  style={{
                    borderColor: isActive ? c.strong : 'var(--ftx-line)',
                    background: isActive ? c.tint : 'var(--ftx-paper)',
                  }}
                  title={c.label}
                >
                  <span
                    className="size-3 rounded-full shrink-0"
                    style={{ background: c.strong, border: '1.5px solid var(--ftx-paper)', boxShadow: '0 0 0 1px var(--ftx-line-strong)' }}
                  />
                  <span className="text-[10px] text-ink-2 truncate flex-1 text-left">
                    {c.label}
                  </span>
                  {isActive && <Check size={10} className="text-brand shrink-0" />}
                </button>
              );
            })}
          </div>
          <p className="px-3 pb-1 text-[10px] text-muted leading-snug">
            El color aparece como acento en el nodo y en el panel de configuración.
          </p>
        </div>

        <div className="ftx-inspector-section pb-3">
          <div className="flex items-center justify-between px-3 pt-2 pb-1">
            <h4 className="ftx-inspector-title !p-0">Secciones inyectadas</h4>
            <span className="ftx-tag-flat">{step.sections.length}</span>
          </div>
          <p className="px-3 pb-2 text-[10px] text-muted leading-snug">
            Aparecen <span className="text-ink">debajo del formulario</span> cuando este paso está activo.
          </p>

          <div className="px-3 space-y-1.5">
            {step.sections.map((sec, sIdx) => (
              <SectionRow
                key={sIdx}
                section={sec}
                onChange={(patch) => updateSection(sIdx, patch)}
                onRemove={() => removeSection(sIdx)}
              />
            ))}
          </div>

          <div className="px-3 pt-2">
            <div className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">
              añadir
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(Object.keys(SECTION_KIND_META) as SectionKind[]).map((kind) => {
                const meta = SECTION_KIND_META[kind];
                return (
                  <button
                    key={kind}
                    onClick={() => addSection(kind)}
                    className="ftx-chip !flex-col !gap-0.5 !p-1.5 text-center"
                    title={meta.description}
                  >
                    <span className="text-sm">{meta.glyph}</span>
                    <span className="text-[9px] font-medium leading-tight">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        className="px-3 py-2.5 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--ftx-line)', background: 'var(--ftx-cream)' }}
      >
        <span className="font-mono text-[10px] text-muted">
          {step.transitions.length} {step.transitions.length === 1 ? 'salida' : 'salidas'}
        </span>
        <button onClick={onDelete} className="ftx-btn ftx-btn-danger !text-xs !py-1 !px-2">
          <Trash2 size={11} /> Eliminar paso
        </button>
      </div>
    </div>
  );
}

function SectionRow({
  section, onChange, onRemove,
}: {
  section: WorkflowStepSection;
  onChange: (patch: Partial<WorkflowStepSection>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = SECTION_KIND_META[section.sectionKind];
  return (
    <div className="ftx-tile">
      <div className="ftx-tile-toolbar">
        <span className="ftx-chip-glyph !w-5 !h-5 !text-[10px]">{meta.glyph}</span>
        <input
          value={section.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className="bg-transparent border-0 outline-none text-[11px] font-medium flex-1 min-w-0"
        />
        <button
          onClick={() => onChange({ required: !section.required })}
          className={[
            'ftx-tag-flat cursor-pointer',
            section.required ? '!text-brand !border-brand' : '',
          ].join(' ')}
          title={section.required ? 'Obligatoria' : 'Opcional'}
        >
          {section.required ? 'req' : 'opt'}
        </button>
        <button
          onClick={() => setOpen(!open)}
          className="ftx-icon-btn"
          title="Configuración"
        >
          <ChevronDown size={11} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
        <button onClick={onRemove} className="ftx-icon-btn ftx-icon-btn-danger" title="Eliminar">
          <Trash2 size={11} />
        </button>
      </div>
      {open && (
        <div
          className="px-2.5 py-1.5"
          style={{ borderTop: '1px solid var(--ftx-line)', background: 'var(--ftx-cream)' }}
        >
          <div className="text-[10px] text-muted mb-1">{meta.description}</div>
          <textarea
            value={section.config ?? ''}
            onChange={(e) => onChange({ config: e.target.value })}
            rows={2}
            placeholder='{"options":["APROBAR","RECHAZAR"]}'
            className="ftx-input-flat font-mono text-[10px] resize-y"
          />
        </div>
      )}
    </div>
  );
}

export function AddStepFab({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="ftx-btn ftx-btn-primary !text-xs absolute z-10"
      style={{ top: 12, left: 12 }}
    >
      <Plus size={12} /> Nuevo paso
    </button>
  );
}
