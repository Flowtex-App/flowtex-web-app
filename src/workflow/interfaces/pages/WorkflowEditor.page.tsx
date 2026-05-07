import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Send, Plus } from 'lucide-react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  applyEdgeChanges,
  applyNodeChanges,
  ConnectionMode,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type ReactFlowInstance,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { AppShell } from '@/shared/ui/components/AppShell';
import { Button } from '@/shared/ui/components/Button';

import {
  newStep, newTransition,
  type ConditionKind, type HandleSide, type WorkflowStep,
} from '../../domain/models/Workflow';
import { useWorkflowStore } from '../stores/workflow.store';

import { StepNode } from '../components/nodes/StepNode';
import { StartNode } from '../components/nodes/StartNode';
import { EndNode } from '../components/nodes/EndNode';
import { ConditionEdge } from '../components/nodes/ConditionEdge';
import { ConnectionModal } from '../components/ConnectionModal';
import { StepInspector } from '../components/StepInspector';

const START_NODE_ID = '__start__';
const END_NODE_ID = '__end__';

type RFNode = Node;
type RFEdge = Edge;

// Edge data carries the transition info
interface EdgeData extends Record<string, unknown> {
  conditionKind: ConditionKind;
  label: string;
  config: string | null;
  sourceHandle?: HandleSide | null;
  targetHandle?: HandleSide | null;
  /** True when this edge is the entry from the Start node (special-case persisted as step.position=0). */
  isEntry?: boolean;
}

// Node data for step nodes
interface StepNodeData extends Record<string, unknown> {
  tempId: string;
  step: WorkflowStep;
}

const nodeTypes = {
  step: StepNode,
  start: StartNode,
  end: EndNode,
};
const edgeTypes = {
  cond: ConditionEdge,
};

export default function WorkflowEditorPage() {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner />
    </ReactFlowProvider>
  );
}

function WorkflowEditorInner() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id && params.id !== 'new' ? Number(params.id) : null;
  const isNew = id === null;

  const { current, loading, saving, error, loadOne, saveOne, publishOne, resetCurrent } = useWorkflowStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nodes, setNodes] = useState<RFNode[]>([]);
  const [edges, setEdges] = useState<RFEdge[]>([]);
  const [selectedStepTempId, setSelectedStepTempId] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [pendingConnection, setPendingConnection] = useState<{
    source: string;
    target: string;
    sourceHandle: HandleSide | null;
    targetHandle: HandleSide | null;
    existingEdgeId?: string;
  } | null>(null);
  const rfRef = useRef<ReactFlowInstance | null>(null);

  // Load
  useEffect(() => {
    if (isNew) {
      resetCurrent();
      const seed = newStep(0, 240, 160);
      seed.transitions = [newTransition(null, 'ON_APPROVE', 0), newTransition(null, 'ON_REJECT', 1)];
      setName('');
      setDescription('');
      setNodes(buildNodes([seed]));
      setEdges(buildEdges([seed]));
      setSelectedStepTempId(seed.tempId);
    } else {
      loadOne(id!);
    }
  }, [id, isNew, loadOne, resetCurrent]);

  useEffect(() => {
    if (current && !isNew) {
      setName(current.name);
      setDescription(current.description ?? '');
      const stepsCopy: WorkflowStep[] = current.steps.map((s) => ({
        ...s,
        sections: [...s.sections],
        transitions: [...s.transitions],
      }));
      setNodes(buildNodes(stepsCopy));
      setEdges(buildEdges(stepsCopy));
    }
  }, [current, isNew]);

  // Helpers — extract steps from current node state
  const stepsFromNodes = useCallback((): WorkflowStep[] => {
    return nodes
      .filter((n) => n.type === 'step')
      .map((n) => {
        const data = n.data as StepNodeData;
        return {
          ...data.step,
          canvasX: n.position.x,
          canvasY: n.position.y,
        };
      });
  }, [nodes]);

  // Sync transitions back into steps based on current edges
  const buildStepsForSave = useCallback((): WorkflowStep[] => {
    const steps = stepsFromNodes();
    // Build a map keyed by tempId
    const byTempId = new Map<string, WorkflowStep>();
    for (const s of steps) {
      byTempId.set(s.tempId, { ...s, transitions: [], position: 0 });
    }

    // Determine entry: the edge from start → some step. The entry step gets position 0,
    // others are sorted by canvas Y (top-first) and broken ties by X (left-first).
    const entryEdge = edges.find((e) => e.source === START_NODE_ID);
    const entryStepTempId = entryEdge ? entryEdge.target : null;

    // Assign positions
    const ordered = [...steps].sort((a, b) => {
      if (a.tempId === entryStepTempId) return -1;
      if (b.tempId === entryStepTempId) return 1;
      if (a.canvasY !== b.canvasY) return a.canvasY - b.canvasY;
      return a.canvasX - b.canvasX;
    });
    ordered.forEach((s, idx) => {
      const target = byTempId.get(s.tempId);
      if (target) target.position = idx;
    });

    // Wire transitions from edges (excluding the start→entry edge, that's implicit position=0)
    for (const e of edges) {
      if (e.source === START_NODE_ID) continue;
      const sourceStep = byTempId.get(e.source);
      if (!sourceStep) continue;
      const data = (e.data ?? {}) as EdgeData;
      const targetRef = e.target === END_NODE_ID ? null : e.target;
      sourceStep.transitions.push({
        toStepId: null,
        toStepRef: targetRef,
        conditionKind: data.conditionKind ?? 'ALWAYS',
        label: data.label || null,
        position: sourceStep.transitions.length,
        config: data.config ?? null,
        sourceHandle: asHandle(e.sourceHandle ?? null),
        targetHandle: asHandle(e.targetHandle ?? null),
      });
    }

    return Array.from(byTempId.values()).sort((a, b) => a.position - b.position);
  }, [stepsFromNodes, edges]);

  // ─── React Flow handlers ────────────────────────────────────────────
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((conn: Connection) => {
    if (!conn.source || !conn.target) return;
    if (conn.source === conn.target) return;
    const sh = asHandle(conn.sourceHandle ?? null);
    const th = asHandle(conn.targetHandle ?? null);
    // Avoid duplicate edges (same source→target on the same condition is rejected later;
    // here just guard against the exact same source/target with same handles)
    const dup = edges.find((e) =>
      e.source === conn.source && e.target === conn.target &&
      e.sourceHandle === conn.sourceHandle && e.targetHandle === conn.targetHandle,
    );
    if (dup) return;
    // Connecting from start → directly add as ALWAYS (no modal needed for entry)
    if (conn.source === START_NODE_ID) {
      const hasEntry = edges.some((e) => e.source === START_NODE_ID);
      if (hasEntry) return;
      setEdges((eds) => [
        ...eds,
        makeEdge(conn.source!, conn.target!, sh, th, {
          conditionKind: 'ALWAYS', label: '', config: null, isEntry: true,
        }),
      ]);
      return;
    }
    // Otherwise open the modal
    setPendingConnection({
      source: conn.source,
      target: conn.target,
      sourceHandle: sh,
      targetHandle: th,
    });
  }, [edges]);

  const onEdgeDoubleClick = useCallback((_evt: React.MouseEvent, edge: Edge) => {
    if (edge.source === START_NODE_ID) return;
    setPendingConnection({
      source: edge.source,
      target: edge.target,
      sourceHandle: asHandle(edge.sourceHandle ?? null),
      targetHandle: asHandle(edge.targetHandle ?? null),
      existingEdgeId: edge.id,
    });
  }, []);

  const onNodeClick = useCallback((_evt: React.MouseEvent, node: Node) => {
    if (node.type === 'step') {
      const data = node.data as StepNodeData;
      setSelectedStepTempId(data.tempId);
    } else {
      setSelectedStepTempId(null);
    }
  }, []);

  const submitConnection = (payload: { conditionKind: ConditionKind; label: string; config: string | null }) => {
    if (!pendingConnection) return;
    const { source, target, sourceHandle, targetHandle, existingEdgeId } = pendingConnection;
    if (existingEdgeId) {
      setEdges((eds) =>
        eds.map((e) =>
          e.id === existingEdgeId
            ? { ...e, data: { ...(e.data ?? {}), ...payload } }
            : e,
        ),
      );
    } else {
      setEdges((eds) => [...eds, makeEdge(source, target, sourceHandle, targetHandle, { ...payload })]);
    }
    setPendingConnection(null);
  };

  const cancelConnection = () => setPendingConnection(null);

  const deleteConnection = () => {
    if (!pendingConnection?.existingEdgeId) return;
    setEdges((eds) => eds.filter((e) => e.id !== pendingConnection.existingEdgeId));
    setPendingConnection(null);
  };

  // ─── Toolbar actions ────────────────────────────────────────────────
  const addStep = () => {
    // Place the new step near the center of the canvas viewport
    const center = rfRef.current?.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    const x = center?.x ?? 320;
    const y = center?.y ?? 200;
    const step = newStep(stepsFromNodes().length, x, y);
    setNodes((nds) => [...nds, makeStepNode(step)]);
    setSelectedStepTempId(step.tempId);
  };

  const onSelectedStepChange = (next: WorkflowStep) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.type !== 'step') return n;
        const data = n.data as StepNodeData;
        if (data.tempId !== next.tempId) return n;
        return {
          ...n,
          data: {
            tempId: next.tempId,
            step: next,
          } as StepNodeData,
        };
      }),
    );
  };

  const deleteSelectedStep = () => {
    if (!selectedStepTempId) return;
    if (!confirm('¿Eliminar este paso? Sus transiciones también se eliminarán.')) return;
    setNodes((nds) => nds.filter((n) => {
      if (n.type !== 'step') return true;
      return (n.data as StepNodeData).tempId !== selectedStepTempId;
    }));
    setEdges((eds) => eds.filter((e) => e.source !== selectedStepTempId && e.target !== selectedStepTempId));
    setSelectedStepTempId(null);
  };

  // ─── Save / publish ─────────────────────────────────────────────────
  const onSave = async () => {
    setSavedNotice(null);
    try {
      const stepsToSave = buildStepsForSave();
      const saved = await saveOne({
        id: isNew ? undefined : id!,
        draft: { name, description, steps: stepsToSave },
      });
      setSavedNotice('Cambios guardados');
      if (isNew) navigate(`/workflows/${saved.id}`, { replace: true });
    } catch {
      // store handles error
    }
  };

  const onPublish = async () => {
    if (!id) return;
    if (!confirm('¿Publicar este workflow? Esta versión será la activa.')) return;
    await publishOne(id);
    setSavedNotice('Workflow publicado');
  };

  // ─── Selected step lookup ───────────────────────────────────────────
  const selectedStep = useMemo<WorkflowStep | null>(() => {
    if (!selectedStepTempId) return null;
    const node = nodes.find((n) => n.type === 'step' && (n.data as StepNodeData).tempId === selectedStepTempId);
    if (!node) return null;
    return (node.data as StepNodeData).step;
  }, [selectedStepTempId, nodes]);

  // Modal labels
  const labelFor = (id: string): string => {
    if (id === START_NODE_ID) return 'INICIO';
    if (id === END_NODE_ID) return 'FIN';
    const node = nodes.find((n) => n.id === id);
    if (!node || node.type !== 'step') return id;
    return (node.data as StepNodeData).step.label;
  };

  // Existing edge data when editing
  const editingEdgeData = useMemo(() => {
    if (!pendingConnection?.existingEdgeId) return undefined;
    const e = edges.find((e) => e.id === pendingConnection.existingEdgeId);
    if (!e) return undefined;
    const d = (e.data ?? {}) as EdgeData;
    return {
      conditionKind: d.conditionKind ?? 'ALWAYS',
      label: d.label ?? '',
      config: d.config ?? null,
    };
  }, [pendingConnection, edges]);

  return (
    <AppShell fitViewport>
      <div className="h-full flex flex-col min-h-0">
        {/* Top bar */}
        <div
          className="h-12 px-4 flex items-center gap-3 shrink-0"
          style={{ background: 'var(--ftx-paper)', borderBottom: '1px solid var(--ftx-line)' }}
        >
          <button
            onClick={() => navigate('/workflows')}
            className="ftx-btn ftx-btn-ghost text-xs py-1 px-2"
          >
            <ArrowLeft size={14} /> Workflows
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-mono text-[9px] tracking-widest text-muted uppercase">
              workflow //
            </span>
            {!isNew && current && (
              <>
                <span className="ftx-tag-flat">id {current.id}</span>
                <span
                  className={`ftx-tag-flat ${
                    current.status === 'PUBLISHED'
                      ? '!text-success !border-success'
                      : '!text-warning !border-warning'
                  }`}
                >
                  {current.status.toLowerCase()}
                </span>
              </>
            )}
            {isNew && <span className="ftx-tag ftx-tag-brand text-[9px]">NUEVO</span>}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del workflow..."
              className="font-display font-bold text-base text-ink bg-transparent border-0 outline-none focus:bg-cream px-2 py-1 rounded flex-1 min-w-0"
            />
          </div>

          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="descripción corta..."
            className="hidden md:block ftx-input-flat !text-xs !py-1 max-w-[280px]"
          />

          <Button onClick={onSave} disabled={saving} icon={<Save size={14} />} className="text-xs py-1.5 px-3">
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
          {!isNew && current?.status !== 'PUBLISHED' && (
            <Button variant="primary" onClick={onPublish} icon={<Send size={14} />} className="text-xs py-1.5 px-3">
              Publicar
            </Button>
          )}
        </div>

        {(error || savedNotice) && (
          <div className="px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--ftx-line)' }}>
            {error && (
              <div className="text-xs rounded p-2 font-medium"
                   style={{ background: 'var(--ftx-brand-soft)', border: '1px solid var(--ftx-brand)', color: 'var(--ftx-brand-deep)' }}>
                {error}
              </div>
            )}
            {savedNotice && !error && (
              <div className="text-xs rounded p-2 font-medium"
                   style={{ background: 'rgba(13,148,96,0.1)', border: '1px solid var(--ftx-success)', color: 'var(--ftx-success)' }}>
                {savedNotice}
              </div>
            )}
          </div>
        )}

        {loading && !current && !isNew && (
          <div className="px-4 py-2 text-muted text-xs">Cargando...</div>
        )}

        {/* Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-0 min-h-0 overflow-hidden">
          {/* Canvas */}
          <section className="relative overflow-hidden" style={{ background: 'var(--ftx-canvas)' }}>
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-2 pointer-events-none">
              <button
                onClick={addStep}
                className="ftx-btn ftx-btn-primary !text-xs pointer-events-auto"
              >
                <Plus size={12} /> Nuevo paso
              </button>
              <span
                className="font-mono text-[10px] uppercase tracking-widest pointer-events-none"
                style={{
                  color: 'var(--ftx-muted)',
                  background: 'var(--ftx-paper)',
                  border: '1px solid var(--ftx-line)',
                  padding: '4px 8px',
                  borderRadius: 3,
                }}
              >
                {nodes.filter((n) => n.type === 'step').length} pasos · {edges.length} transiciones
              </span>
              <div className="flex-1" />
              <span
                className="font-mono text-[10px] hidden lg:block pointer-events-none"
                style={{
                  color: 'var(--ftx-muted)',
                  background: 'var(--ftx-paper)',
                  border: '1px solid var(--ftx-line)',
                  padding: '4px 8px',
                  borderRadius: 3,
                }}
              >
                arrastra desde el círculo inferior · doble click flecha para configurar
              </span>
            </div>

            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeDoubleClick={onEdgeDoubleClick}
              onNodeClick={onNodeClick}
              onPaneClick={() => setSelectedStepTempId(null)}
              onInit={(inst) => { rfRef.current = inst; }}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              connectionMode={ConnectionMode.Loose}
              defaultEdgeOptions={{
                type: 'cond',
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 22,
                  height: 22,
                  color: 'var(--ftx-ink-2)',
                },
              }}
              fitView
              fitViewOptions={{ padding: 0.25 }}
              proOptions={{ hideAttribution: true }}
            >
              <Background gap={24} size={1.5} color="var(--ftx-line-strong)" />
              <Controls
                position="bottom-right"
                style={{
                  background: 'var(--ftx-paper)',
                  border: '1px solid var(--ftx-line)',
                  borderRadius: 4,
                }}
              />
              <MiniMap
                position="bottom-left"
                pannable
                zoomable
                style={{
                  background: 'var(--ftx-paper)',
                  border: '1px solid var(--ftx-line)',
                }}
                nodeColor={(n) => {
                  if (n.type === 'start') return 'var(--ftx-success)';
                  if (n.type === 'end')   return 'var(--ftx-ink)';
                  return 'var(--ftx-brand)';
                }}
              />
            </ReactFlow>
          </section>

          {/* Inspector */}
          <aside
            className="hidden lg:flex flex-col overflow-hidden"
            style={{ borderLeft: '1px solid var(--ftx-line)', background: 'var(--ftx-paper)' }}
          >
            <StepInspector
              step={selectedStep}
              onChange={onSelectedStepChange}
              onDelete={deleteSelectedStep}
            />
          </aside>
        </div>
      </div>

      {/* Connection / edit modal */}
      <ConnectionModal
        open={!!pendingConnection}
        fromLabel={pendingConnection ? labelFor(pendingConnection.source) : ''}
        toLabel={pendingConnection ? labelFor(pendingConnection.target) : ''}
        initial={editingEdgeData}
        onSubmit={submitConnection}
        onCancel={cancelConnection}
        onDelete={pendingConnection?.existingEdgeId ? deleteConnection : undefined}
      />
    </AppShell>
  );
}

// ─── Helpers to build initial graph ────────────────────────────────────

function makeStepNode(step: WorkflowStep): RFNode {
  return {
    id: step.tempId,
    type: 'step',
    position: { x: step.canvasX || 240, y: step.canvasY || 160 },
    data: {
      tempId: step.tempId,
      step,
    } as StepNodeData,
  };
}

function makeEdge(
  source: string,
  target: string,
  sourceHandle: HandleSide | null,
  targetHandle: HandleSide | null,
  data: EdgeData,
): RFEdge {
  const id = `e-${source}-${target}-${data.conditionKind}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id,
    source,
    target,
    sourceHandle: sourceHandle ?? undefined,
    targetHandle: targetHandle ?? undefined,
    type: 'cond',
    data: data as unknown as Record<string, unknown>,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 22,
      height: 22,
      color: 'var(--ftx-ink-2)',
    },
  };
}

const VALID_SIDES: HandleSide[] = ['top', 'right', 'bottom', 'left'];
function asHandle(raw: string | null | undefined): HandleSide | null {
  if (!raw) return null;
  return (VALID_SIDES as string[]).includes(raw) ? (raw as HandleSide) : null;
}

function buildNodes(steps: WorkflowStep[]): RFNode[] {
  // Determine bounding box to place start/end nodes
  if (steps.length === 0) {
    return [
      { id: START_NODE_ID, type: 'start', position: { x: 80, y: 80 }, data: {} },
      { id: END_NODE_ID,   type: 'end',   position: { x: 80, y: 360 }, data: {} },
    ];
  }
  const minX = Math.min(...steps.map((s) => s.canvasX || 240));
  const maxY = Math.max(...steps.map((s) => s.canvasY || 160));
  return [
    { id: START_NODE_ID, type: 'start', position: { x: Math.max(60, minX - 160), y: 80 }, data: {} },
    { id: END_NODE_ID,   type: 'end',   position: { x: Math.max(60, minX - 160), y: maxY + 160 }, data: {} },
    ...steps.map(makeStepNode),
  ];
}

function buildEdges(steps: WorkflowStep[]): RFEdge[] {
  const out: RFEdge[] = [];

  // Implicit start → first step (position 0)
  const entry = steps.find((s) => s.position === 0);
  if (entry) {
    out.push(makeEdge(START_NODE_ID, entry.tempId, 'bottom', 'top', {
      conditionKind: 'ALWAYS', label: '', config: null, isEntry: true,
    }));
  }

  // Every step's transitions
  for (const s of steps) {
    for (const t of s.transitions) {
      const target = t.toStepRef ?? END_NODE_ID;
      out.push(makeEdge(
        s.tempId,
        target,
        t.sourceHandle ?? 'bottom',
        t.targetHandle ?? 'top',
        {
          conditionKind: t.conditionKind,
          label: t.label ?? '',
          config: t.config,
        },
      ));
    }
  }

  return out;
}
