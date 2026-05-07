import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

function StartNodeImpl() {
  return (
    <div
      className="ftx-step-node"
      style={{
        position: 'relative',
        width: 96,
        height: 64,
        background: 'var(--ftx-success)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        borderRadius: 999,
        border: '2px solid var(--ftx-ink)',
        boxShadow: '4px 4px 0 0 var(--ftx-ink)',
      }}
    >
      {/* 4 invisible stripe handles around the perimeter */}
      <Handle
        id="top"
        type="source"
        position={Position.Top}
        className="ftx-stripe-handle"
        style={{ top: -7, left: 0, width: '100%', height: 14, borderRadius: 0, background: 'transparent', border: 'none', transform: 'none' }}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="ftx-stripe-handle"
        style={{ top: 0, right: -7, width: 14, height: '100%', borderRadius: 0, background: 'transparent', border: 'none', transform: 'none' }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="ftx-stripe-handle"
        style={{ bottom: -7, left: 0, width: '100%', height: 14, borderRadius: 0, background: 'transparent', border: 'none', transform: 'none' }}
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className="ftx-stripe-handle"
        style={{ top: 0, left: -7, width: 14, height: '100%', borderRadius: 0, background: 'transparent', border: 'none', transform: 'none' }}
      />

      <Play size={14} />
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        Inicio
      </span>
    </div>
  );
}

export const StartNode = memo(StartNodeImpl);
