import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, Link2, ChevronRight, Plus, Eye, EyeOff } from 'lucide-react';
import { workflowRepository } from '@/workflow/interfaces/composition/workflow-container';
import {
  type Workflow, type WorkflowStep, SECTION_KIND_META, STEP_MODE_META,
} from '@/workflow/domain/models/Workflow';

interface Props {
  formId: number | null;
  workflowId: number | null;
  onLink: (workflowId: number | null) => void;
}

export function WorkflowRail({ formId, workflowId, onLink }: Props) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [allWorkflows, setAllWorkflows] = useState<Workflow[]>([]);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [showSelector, setShowSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workflowId) {
      workflowRepository.getById(workflowId)
        .then(setWorkflow)
        .catch((e) => setError(e instanceof Error ? e.message : 'Error cargando workflow'));
    } else {
      setWorkflow(null);
    }
  }, [workflowId]);

  useEffect(() => {
    if (showSelector) {
      workflowRepository.list().then(setAllWorkflows).catch(() => {});
    }
  }, [showSelector]);

  const activeStep: WorkflowStep | undefined = workflow?.steps[activeStepIdx];

  if (!workflowId) {
    return (
      <div className="ftx-rail p-3 mt-3">
        <div className="flex items-center gap-2.5">
          <GitBranch size={14} style={{ color: 'var(--ftx-info)' }} />
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-widest text-info">
              workflow no enlazado
            </div>
            <div className="text-[12px] text-ink-2 mt-0.5">
              Sin flujo de aprobación. El formulario se envía directamente al estado final.
            </div>
          </div>
          <button
            onClick={() => setShowSelector(!showSelector)}
            disabled={!formId}
            className="ftx-btn !text-[11px] !py-1 !px-2"
            title={!formId ? 'Guarda el formulario primero' : 'Enlazar workflow existente'}
          >
            <Link2 size={11} /> Enlazar
          </button>
          <Link
            to="/workflows/new"
            className="ftx-btn !text-[11px] !py-1 !px-2"
            title="Crear nuevo workflow"
          >
            <Plus size={11} /> Nuevo
          </Link>
        </div>

        {showSelector && (
          <WorkflowSelector
            workflows={allWorkflows}
            onPick={(w) => {
              if (formId) {
                onLink(w.id);
                setShowSelector(false);
              }
            }}
          />
        )}
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="ftx-rail p-3 mt-3 text-[12px] text-muted">
        {error ?? 'Cargando workflow…'}
      </div>
    );
  }

  return (
    <div className="ftx-rail mt-3 overflow-hidden">
      <div className="px-3 py-2 flex items-center gap-2.5"
           style={{ background: 'var(--ftx-paper)', borderBottom: '1px dashed var(--ftx-line-strong)' }}>
        <GitBranch size={14} style={{ color: 'var(--ftx-info)' }} />
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-widest text-info">
            workflow enlazado · {workflow.status.toLowerCase()}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] font-display font-bold text-ink truncate">
              {workflow.name}
            </span>
            <span className="ftx-tag-flat">{workflow.steps.length} pasos</span>
          </div>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="ftx-icon-btn"
          title={showPreview ? 'Ocultar preview' : 'Mostrar preview'}
        >
          {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
        <Link
          to={`/workflows/${workflow.id}`}
          className="ftx-btn ftx-btn-ghost !text-[11px] !py-1 !px-2"
        >
          Editar workflow →
        </Link>
        <button
          onClick={() => {
            if (formId && confirm('¿Desenlazar este workflow del formulario?')) {
              onLink(null);
            }
          }}
          className="ftx-icon-btn ftx-icon-btn-danger"
          title="Desenlazar"
        >
          <Link2 size={11} />
        </button>
      </div>

      {/* Steps strip */}
      <div className="px-3 py-2 flex items-center gap-1 overflow-x-auto">
        {workflow.steps.map((s, i) => {
          const isActive = i === activeStepIdx;
          return (
            <div key={i} className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setActiveStepIdx(i)}
                className={['ftx-step-tab !py-1 !px-2', isActive ? 'active' : ''].join(' ')}
              >
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[11px] font-medium">{s.label}</span>
                  <span className="text-[9px] font-mono text-muted">
                    {s.role.replace('ROLE_', '')} · {s.slaHours}h
                  </span>
                </span>
              </button>
              {i < workflow.steps.length - 1 && (
                <ChevronRight size={11} className="text-muted shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Preview of the injected sections for the selected step */}
      {showPreview && activeStep && (
        <div className="px-3 pb-3 pt-1">
          <div className="ftx-tile p-3" style={{ background: 'var(--ftx-cream)' }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-muted">
                  vista del aprobador · {activeStep.label}
                </div>
                <div className="text-[12px] font-medium text-ink mt-0.5">
                  Lo que se inyecta abajo del formulario en este paso
                </div>
              </div>
              <span className="ftx-tag-flat">{STEP_MODE_META[activeStep.mode].label}</span>
            </div>

            {activeStep.description && (
              <p className="text-[11px] text-ink-2 italic border-l-2 pl-2 mb-2.5"
                 style={{ borderColor: 'var(--ftx-info)' }}>
                {activeStep.description}
              </p>
            )}

            {activeStep.sections.length === 0 ? (
              <div className="text-[11px] text-muted italic py-2">
                Este paso no inyecta secciones. El aprobador solo ve el formulario.
              </div>
            ) : (
              <div className="grid grid-cols-12 gap-2">
                {activeStep.sections.map((sec) => (
                  <SectionPreview key={sec.position} sectionKind={sec.sectionKind} label={sec.label} required={sec.required} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function WorkflowSelector({
  workflows, onPick,
}: {
  workflows: Workflow[];
  onPick: (w: Workflow) => void;
}) {
  return (
    <div className="mt-2 space-y-1.5 max-h-[200px] overflow-y-auto">
      {workflows.length === 0 ? (
        <div className="text-[11px] text-muted text-center py-3">
          No hay workflows disponibles. Crea uno desde <Link to="/workflows/new" className="text-brand">aquí</Link>.
        </div>
      ) : (
        workflows.map((w) => (
          <button
            key={w.id}
            onClick={() => onPick(w)}
            className="w-full text-left ftx-tile p-2 hover:ftx-tile-active"
          >
            <div className="flex items-center gap-2">
              <span className="ftx-chip-glyph !w-6 !h-6 !text-[10px]">
                <GitBranch size={10} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium text-ink truncate">{w.name}</div>
                <div className="text-[10px] text-muted font-mono">
                  {w.steps.length} pasos · {w.status.toLowerCase()}
                </div>
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );
}

function SectionPreview({
  sectionKind, label, required,
}: {
  sectionKind: keyof typeof SECTION_KIND_META;
  label: string;
  required: boolean;
}) {
  const meta = SECTION_KIND_META[sectionKind];

  // Different visual previews per section kind
  const span = sectionKind === 'DECISION' ? 'col-span-12 sm:col-span-6' : 'col-span-12';

  return (
    <div className={`${span}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[11px]">{meta.glyph}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-2">
          {label}
          {required && <span className="text-brand ml-0.5">*</span>}
        </span>
      </div>
      {sectionKind === 'COMMENTS' && (
        <textarea disabled rows={2} placeholder="Comentarios del aprobador..." className="ftx-input-flat !py-1.5 text-[11px]" />
      )}
      {sectionKind === 'DECISION' && (
        <div className="grid grid-cols-3 gap-1">
          <button disabled className="ftx-btn ftx-btn-primary !text-[10px] !py-1 !px-2">APROBAR</button>
          <button disabled className="ftx-btn !text-[10px] !py-1 !px-2">DEVOLVER</button>
          <button disabled className="ftx-btn ftx-btn-danger !text-[10px] !py-1 !px-2">RECHAZAR</button>
        </div>
      )}
      {sectionKind === 'EVIDENCE' && (
        <div className="px-2 py-2 border border-dashed rounded text-[10px] text-muted italic"
             style={{ borderColor: 'var(--ftx-line-strong)', background: 'var(--ftx-paper)' }}>
          Adjuntar evidencia del aprobador
        </div>
      )}
      {sectionKind === 'CHECKLIST' && (
        <div className="space-y-0.5">
          <label className="flex items-center gap-1.5 text-[11px] text-ink-2">
            <input type="checkbox" disabled className="size-3 accent-brand" />
            Item 1 del checklist
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-ink-2">
            <input type="checkbox" disabled className="size-3 accent-brand" />
            Item 2 del checklist
          </label>
        </div>
      )}
      {sectionKind === 'SLA_TIMER' && (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded font-mono text-[11px]"
             style={{ background: 'var(--ftx-paper)', border: '1px solid var(--ftx-line)' }}>
          <span className="text-warning">⏱</span>
          <span className="text-ink">47h 30m restantes</span>
        </div>
      )}
    </div>
  );
}
