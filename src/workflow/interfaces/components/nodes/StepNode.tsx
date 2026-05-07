import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Clock, Users } from 'lucide-react';
import { STEP_MODE_META, colorMeta, type WorkflowStep } from '../../../domain/models/Workflow';

export interface StepNodeData extends Record<string, unknown> {
  tempId: string;
  step: WorkflowStep;
  isStart?: boolean;
}

const STRIPE_THICKNESS = 14;

const HINT_DOTS = [
  // (x, y) in % of the node bounding box
  { id: 'tl', top: '0%',   left: '0%'   },
  { id: 't',  top: '0%',   left: '50%'  },
  { id: 'tr', top: '0%',   left: '100%' },
  { id: 'r',  top: '50%',  left: '100%' },
  { id: 'br', top: '100%', left: '100%' },
  { id: 'b',  top: '100%', left: '50%'  },
  { id: 'bl', top: '100%', left: '0%'   },
  { id: 'l',  top: '50%',  left: '0%'   },
];

function StepNodeImpl({ data, selected }: NodeProps) {
  const d = data as unknown as StepNodeData;
  const step = d.step;
  if (!step) return null;

  const role = (step.role ?? 'ROLE_USER').replace('ROLE_', '');
  const modeMeta = STEP_MODE_META[step.mode] ?? STEP_MODE_META.SEQUENTIAL;
  const sectionsCount = step.sections?.length ?? 0;
  const cm = colorMeta(step.color);

  const borderColor = selected ? 'var(--ftx-brand)' : cm.border;
  const accentColor = cm.strong;

  return (
    <div
      className="ftx-step-node"
      style={{
        position: 'relative',
        minWidth: 220,
        background: 'var(--ftx-paper)',
        border: `1px solid ${borderColor}`,
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: 4,
        boxShadow: selected
          ? `0 0 0 1px ${borderColor}, 0 8px 16px -8px ${accentColor}40`
          : '0 1px 0 0 rgba(0,0,0,0.04), 0 8px 16px -10px rgba(0,0,0,0.10)',
        transition: 'box-shadow 100ms ease, border-color 100ms ease',
      }}
    >
      {/* ─── 4 stripe handles covering each entire side (functional) ─── */}
      <Handle
        id="top"
        type="source"
        position={Position.Top}
        className="ftx-stripe-handle ftx-stripe-handle-top"
        style={{
          top: -STRIPE_THICKNESS / 2,
          left: 0,
          width: '100%',
          height: STRIPE_THICKNESS,
          borderRadius: 0,
          background: 'transparent',
          border: 'none',
          transform: 'none',
        }}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="ftx-stripe-handle ftx-stripe-handle-right"
        style={{
          top: 0,
          right: -STRIPE_THICKNESS / 2,
          width: STRIPE_THICKNESS,
          height: '100%',
          borderRadius: 0,
          background: 'transparent',
          border: 'none',
          transform: 'none',
        }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="ftx-stripe-handle ftx-stripe-handle-bottom"
        style={{
          bottom: -STRIPE_THICKNESS / 2,
          left: 0,
          width: '100%',
          height: STRIPE_THICKNESS,
          borderRadius: 0,
          background: 'transparent',
          border: 'none',
          transform: 'none',
        }}
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className="ftx-stripe-handle ftx-stripe-handle-left"
        style={{
          top: 0,
          left: -STRIPE_THICKNESS / 2,
          width: STRIPE_THICKNESS,
          height: '100%',
          borderRadius: 0,
          background: 'transparent',
          border: 'none',
          transform: 'none',
        }}
      />

      {/* ─── 8 decorative hint dots around the perimeter (visible on hover) ─── */}
      {HINT_DOTS.map((p) => (
        <span
          key={p.id}
          className="ftx-step-hint-dot"
          style={{
            top: p.top,
            left: p.left,
            background: accentColor,
          }}
        />
      ))}

      {/* ─── Card content ───────────────────────────────────────────────── */}
      <div
        className="ftx-tile-toolbar"
        style={{
          background: cm.tint,
          borderBottom: `1px solid ${cm.border}33`,
          borderRadius: '0 4px 0 0',
          marginLeft: -1,
        }}
      >
        <span
          className="text-[10px] font-mono uppercase tracking-widest"
          style={{ color: 'var(--ftx-muted)' }}
        >
          {d.isStart ? 'entry' : 'step'}
        </span>
        <span className="text-[12px] font-medium text-ink truncate flex-1">
          {step.label || 'Sin etiqueta'}
        </span>
        {sectionsCount > 0 && (
          <span className="ftx-tag-flat !text-info !border-info">
            +{sectionsCount}
          </span>
        )}
      </div>

      <div className="px-3 py-2 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] text-ink-2">
          <Users size={11} className="text-muted" />
          <span className="font-medium">{role}</span>
          <span className="text-muted">·</span>
          <span className="font-mono text-[10px]">{modeMeta.label}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-ink-2">
          <Clock size={11} className="text-muted" />
          <span className="font-mono">SLA {step.slaHours ?? 48}h</span>
        </div>
      </div>
    </div>
  );
}

export const StepNode = memo(StepNodeImpl);
