import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Square } from 'lucide-react';

function EndNodeImpl() {
  return (
    <div
      className="ftx-step-node"
      style={{
        position: 'relative',
        width: 96,
        height: 64,
        background: 'var(--ftx-ink)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        borderRadius: 8,
        border: '2px solid var(--ftx-ink)',
        boxShadow: '4px 4px 0 0 var(--ftx-brand)',
      }}
    >
      {/* 4 invisible stripe handles — End is target-only but in Loose mode any handle accepts */}
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="ftx-stripe-handle"
        style={{ top: -7, left: 0, width: '100%', height: 14, borderRadius: 0, background: 'transparent', border: 'none', transform: 'none' }}
      />
      <Handle
        id="right"
        type="target"
        position={Position.Right}
        className="ftx-stripe-handle"
        style={{ top: 0, right: -7, width: 14, height: '100%', borderRadius: 0, background: 'transparent', border: 'none', transform: 'none' }}
      />
      <Handle
        id="bottom"
        type="target"
        position={Position.Bottom}
        className="ftx-stripe-handle"
        style={{ bottom: -7, left: 0, width: '100%', height: 14, borderRadius: 0, background: 'transparent', border: 'none', transform: 'none' }}
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        className="ftx-stripe-handle"
        style={{ top: 0, left: -7, width: 14, height: '100%', borderRadius: 0, background: 'transparent', border: 'none', transform: 'none' }}
      />

      <Square size={14} />
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        Fin
      </span>
    </div>
  );
}

export const EndNode = memo(EndNodeImpl);
