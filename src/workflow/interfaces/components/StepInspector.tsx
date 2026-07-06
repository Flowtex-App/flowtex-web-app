import { Trash2, Plus, ChevronDown, Check, UserPlus, Users as UsersIcon, Filter, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  type WorkflowStep, type WorkflowStepSection, type WorkflowStepApprover, type ApproverKind,
  type SectionKind, type StepMode, type StepColor,
  DEFAULT_ROLES, SECTION_KIND_META, STEP_MODE_META, STEP_COLORS, colorMeta, newSection,
  newApproverAreaPosition,
} from '../../domain/models/Workflow';
import { AREAS, type Area } from '@/iam/domain/models/Area';
import { POSITIONS, type Position } from '@/iam/domain/models/Position';
import { iamPorts } from '@/iam/interfaces/composition/iam-container';
import type { User, Role } from '@/iam/domain/models/User';

interface Props {
  step: WorkflowStep | null;
  onChange: (next: WorkflowStep) => void;
  onDelete: () => void;
}

// La sección DECISION se omite del catálogo: las opciones de aprobar / rechazar
// se derivan automáticamente de las flechas salientes del nodo en el canvas.
const ADDABLE_SECTION_KINDS: SectionKind[] = (Object.keys(SECTION_KIND_META) as SectionKind[])
  .filter((k) => k !== 'DECISION');

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

  const updateApprover = (idx: number, patch: Partial<WorkflowStepApprover>) => {
    update({ approvers: step.approvers.map((a, i) => (i === idx ? { ...a, ...patch } : a)) });
  };

  const removeApprover = (idx: number) => {
    update({
      approvers: step.approvers.filter((_, i) => i !== idx).map((a, i) => ({ ...a, position: i })),
    });
  };

  const addApprover = (kind: ApproverKind) => {
    const next = kind === 'AREA_POSITION'
      ? newApproverAreaPosition('TECNOLOGIA', 'JEFE', step.approvers.length)
      : { position: step.approvers.length, kind, userId: null, area: null, userPosition: null, role: null };
    update({ approvers: [...step.approvers, next] });
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
          <div className="flex-1" />
          <button
            onClick={onDelete}
            className="ftx-btn ftx-btn-danger !text-[10px] !py-1 !px-2"
            title="Eliminar este paso del flujo"
          >
            <Trash2 size={11} /> Eliminar
          </button>
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
            <label>Rol legacy</label>
            <select
              value={step.role}
              onChange={(e) => update({ role: e.target.value })}
              className="ftx-input-flat"
              title="Rol genérico usado solo si no se asignan aprobadores específicos"
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
            <h4 className="ftx-inspector-title !p-0">Aprobadores</h4>
            <span className="ftx-tag-flat">{step.approvers.length}</span>
          </div>
          <p className="px-3 pb-2 text-[10px] text-muted leading-snug">
            Quiénes pueden cerrar este paso. Se combina con el modo de arriba:
            <span className="text-ink"> {STEP_MODE_META[step.mode].label}</span>.
          </p>

          <div className="px-3 space-y-1.5">
            {step.approvers.map((a, idx) => (
              <ApproverRow
                key={idx}
                approver={a}
                onChange={(patch) => updateApprover(idx, patch)}
                onRemove={() => removeApprover(idx)}
              />
            ))}
            {step.approvers.length === 0 && (
              <div
                className="text-center py-3 text-[10px] text-muted italic rounded border border-dashed"
                style={{ borderColor: 'var(--ftx-line-strong)' }}
              >
                Sin aprobadores asignados — se usará el rol legacy "{step.role.replace('ROLE_', '')}"
              </div>
            )}
          </div>

          <div className="px-3 pt-2 grid grid-cols-2 gap-1.5">
            <button
              onClick={() => addApprover('USER')}
              className="ftx-btn !text-[11px] !py-1.5"
              title="Asignar un usuario específico por código de empleado"
            >
              <UserPlus size={11} /> Usuario
            </button>
            <button
              onClick={() => addApprover('AREA_POSITION')}
              className="ftx-btn !text-[11px] !py-1.5"
              title="Filtro dinámico: cualquier usuario con esa área y cargo"
            >
              <Filter size={11} /> Área + cargo
            </button>
          </div>
        </div>

        <div className="ftx-inspector-section pb-3">
          <div className="flex items-center justify-between px-3 pt-2 pb-1">
            <h4 className="ftx-inspector-title !p-0">Secciones inyectadas</h4>
            <span className="ftx-tag-flat">{step.sections.length}</span>
          </div>
          <p className="px-3 pb-2 text-[10px] text-muted leading-snug">
            Aparecen <span className="text-ink">debajo del formulario</span> cuando este paso está activo.
            La <span className="text-ink">decisión</span> se construye automáticamente desde las flechas que salen del nodo.
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
              {ADDABLE_SECTION_KINDS.map((kind) => {
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
        className="px-3 py-2 flex items-center"
        style={{ borderTop: '1px solid var(--ftx-line)', background: 'var(--ftx-cream)' }}
      >
        <span className="font-mono text-[10px] text-muted">
          {step.transitions.length} {step.transitions.length === 1 ? 'salida' : 'salidas'}
          {step.transitions.length > 0 && ' — cada flecha es una decisión'}
        </span>
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

function ApproverRow({
  approver, onChange, onRemove,
}: {
  approver: WorkflowStepApprover;
  onChange: (patch: Partial<WorkflowStepApprover>) => void;
  onRemove: () => void;
}) {
  if (approver.kind === 'USER') {
    return (
      <UserApproverRow approver={approver} onChange={onChange} onRemove={onRemove} />
    );
  }
  if (approver.kind === 'AREA_POSITION') {
    return (
      <div className="ftx-tile">
        <div className="ftx-tile-toolbar">
          <Filter size={11} className="text-info shrink-0" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-info">filtro</span>
          <div className="flex-1" />
          <button onClick={onRemove} className="ftx-icon-btn ftx-icon-btn-danger" title="Eliminar">
            <Trash2 size={11} />
          </button>
        </div>
        <div className="px-2.5 py-2 grid grid-cols-2 gap-1.5">
          <select
            value={approver.area ?? ''}
            onChange={(e) => onChange({ area: e.target.value })}
            className="ftx-input-flat !text-[11px]"
          >
            <option value="">Área...</option>
            {AREAS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
          <select
            value={approver.userPosition ?? ''}
            onChange={(e) => onChange({ userPosition: e.target.value })}
            className="ftx-input-flat !text-[11px]"
          >
            <option value="">Cargo...</option>
            {POSITIONS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <ApproverReach kind="AREA_POSITION" area={approver.area} position={approver.userPosition} />
      </div>
    );
  }
  // ROLE legacy fallback row
  return (
    <div className="ftx-tile">
      <div className="ftx-tile-toolbar">
        <UsersIcon size={11} className="text-muted" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted">rol</span>
        <span className="text-[11px] text-ink">{(approver.role ?? '').replace('ROLE_', '')}</span>
        <div className="flex-1" />
        <button onClick={onRemove} className="ftx-icon-btn ftx-icon-btn-danger" title="Eliminar">
          <Trash2 size={11} />
        </button>
      </div>
      <ApproverReach kind="ROLE" role={approver.role} />
    </div>
  );
}

/**
 * Indicador de alcanzabilidad: cuántos usuarios reales podrían atender un
 * aprobador por ROL o por ÁREA+CARGO. Evita configurar un paso sin aprobador.
 */
function ApproverReach({
  kind, area, position, role,
}: {
  kind: 'ROLE' | 'AREA_POSITION';
  area?: string | null;
  position?: string | null;
  role?: string | null;
}) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let users: User[] = [];
        if (kind === 'AREA_POSITION') {
          if (!area || !position) { if (alive) setCount(null); return; }
          users = await iamPorts.userRepository.list({ area: area as Area, position: position as Position });
        } else {
          if (!role) { if (alive) setCount(null); return; }
          const all = await iamPorts.userRepository.list();
          users = all.filter((u) => u.roles.includes(role as Role));
        }
        if (alive) setCount(users.length);
      } catch {
        if (alive) setCount(null);
      }
    })();
    return () => { alive = false; };
  }, [kind, area, position, role]);

  if (count === null) return null;
  return count > 0 ? (
    <div className="px-2.5 pb-1.5 text-[10px] text-muted flex items-center gap-1">
      <Check size={10} className="text-success" />
      {count} usuario{count === 1 ? '' : 's'} puede{count === 1 ? '' : 'n'} aprobar este paso
    </div>
  ) : (
    <div className="px-2.5 pb-1.5 text-[10px] text-brand flex items-center gap-1">
      <Filter size={10} /> Ningún usuario coincide: este paso quedaría sin aprobador.
    </div>
  );
}

function UserApproverRow({
  approver, onChange, onRemove,
}: {
  approver: WorkflowStepApprover;
  onChange: (patch: Partial<WorkflowStepApprover>) => void;
  onRemove: () => void;
}) {
  const [searchOpen, setSearchOpen] = useState(approver.userId == null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchOpen) {
      setResults([]);
      return;
    }
    // Con query >= 2 busca; sin query, muestra la lista de usuarios para elegir
    // (antes exigia escribir y no habia forma de "ver la lista para anadir usuarios").
    const hasQuery = query.trim().length >= 2;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const users = await iamPorts.userRepository.list(hasQuery ? { q: query } : undefined);
        setResults(users.slice(0, 12));
      } finally {
        setLoading(false);
      }
    }, hasQuery ? 220 : 0);
    return () => clearTimeout(t);
  }, [query, searchOpen]);

  const pick = (u: User) => {
    onChange({
      userId: u.id,
      userLabel: u.fullName,
      userEmployeeCode: u.employeeCode,
    });
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <div className="ftx-tile">
      <div className="ftx-tile-toolbar">
        <UserPlus size={11} className="text-brand shrink-0" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand">usuario</span>
        {approver.userId && !searchOpen ? (
          <span className="text-[11px] text-ink truncate flex-1">
            {approver.userLabel ?? `#${approver.userId}`}{' '}
            {approver.userEmployeeCode && (
              <span className="text-[9px] font-mono text-muted">· {approver.userEmployeeCode}</span>
            )}
          </span>
        ) : (
          <span className="text-[11px] text-muted italic flex-1">Buscar empleado...</span>
        )}
        <button
          onClick={() => setSearchOpen((v) => !v)}
          className="ftx-icon-btn"
          title="Cambiar usuario"
        >
          <Search size={11} />
        </button>
        <button onClick={onRemove} className="ftx-icon-btn ftx-icon-btn-danger" title="Eliminar">
          <Trash2 size={11} />
        </button>
      </div>
      {searchOpen && (
        <div
          className="px-2.5 py-2"
          style={{ borderTop: '1px solid var(--ftx-line)', background: 'var(--ftx-cream)' }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Código C12345 o nombre..."
            className="ftx-input-flat !text-[11px] mb-1.5"
            autoFocus
          />
          {loading && <div className="text-[10px] text-muted italic">Buscando...</div>}
          {!loading && results.length > 0 && (
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {results.map((u) => (
                <button
                  key={u.id}
                  onClick={() => pick(u)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-paper text-left transition-colors"
                >
                  <div
                    className="size-6 rounded grid place-items-center font-display font-bold text-[9px] text-white shrink-0"
                    style={{ background: 'var(--ftx-brand)' }}
                  >
                    {u.initials()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-ink truncate">{u.fullName}</div>
                    <div className="text-[9px] text-muted font-mono truncate">
                      {u.employeeCode || '—'} · {u.formattedPosition() || '—'} · {u.areaLabel || '—'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="text-[10px] text-muted italic">Sin resultados.</div>
          )}
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
