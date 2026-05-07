import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { CONDITION_META, type ConditionKind } from '../../../domain/models/Workflow';

export interface ConditionEdgeData {
  conditionKind: ConditionKind;
  label: string | null;
}

function ConditionEdgeImpl({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected,
}: EdgeProps) {
  const d = data as unknown as ConditionEdgeData;
  const condition = d?.conditionKind ?? 'ALWAYS';
  const meta = CONDITION_META[condition];

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 14,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? 'var(--ftx-brand)' : meta.color,
          strokeWidth: selected ? 2.5 : 1.8,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            className="px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-widest"
            style={{
              background: 'var(--ftx-paper)',
              color: meta.color,
              border: `1px solid ${meta.color}`,
              borderRadius: 3,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {meta.label}
            {d?.label && (
              <span style={{ marginLeft: 4, color: 'var(--ftx-ink-2)', fontWeight: 500 }}>
                · {d.label}
              </span>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const ConditionEdge = memo(ConditionEdgeImpl);
