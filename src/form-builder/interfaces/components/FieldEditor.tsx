import { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import {
  FormField, widthClassName, type FieldWidth,
} from '../../domain/models/FormField';
import { FIELD_TYPE_META } from '../../domain/models/FieldType';
import { FieldRender } from './FieldRender';

interface Props {
  field: FormField;
  index: number;
  selected: boolean;
  /** Width of the canvas in pixels — used to compute resize snapping. */
  canvasWidthPx: number;
  onSelect: () => void;
  onChange: (next: FormField) => void;
  onDelete: () => void;
}

export function FieldEditor({
  field, index, selected, canvasWidthPx,
  onSelect, onChange, onDelete,
}: Props) {
  const sortableId = field.id ? `field:${field.id}` : `field:tmp-${field.fieldKey}-${index}`;
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: sortableId });

  const meta = FIELD_TYPE_META[field.fieldType];
  const tileRef = useRef<HTMLDivElement | null>(null);
  const [previewWidth, setPreviewWidth] = useState<FieldWidth | null>(null);
  const [previewRows, setPreviewRows] = useState<number | null>(null);
  const [resizing, setResizing] = useState<'h' | 'v' | null>(null);

  const effectiveWidth = previewWidth ?? field.width;
  const effectiveRows = previewRows ?? field.rows;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    minHeight: `${effectiveRows * 90}px`,
    ...(field.colStart != null ? { gridColumnStart: field.colStart } : {}),
    ...(field.rowStart != null ? { gridRowStart: field.rowStart } : {}),
    ...(effectiveRows > 1 ? { gridRowEnd: `span ${effectiveRows}` } : {}),
  };

  // Horizontal width resize via right-edge handle
  const onResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const colWidth = canvasWidthPx / 12;
    if (!colWidth || !isFinite(colWidth)) return;

    const startX = e.clientX;
    const startWidth = field.width;
    setResizing('h');

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      const colDelta = Math.round(delta / colWidth);
      const next = clamp(startWidth + colDelta, 1, 12) as FieldWidth;
      setPreviewWidth(next);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      setResizing(null);
      setPreviewWidth((finalWidth) => {
        if (finalWidth && finalWidth !== field.width) {
          onChange(field.with({ width: finalWidth }));
        }
        return null;
      });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const onResizeStartV = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rowHeight = 90;
    const startY = e.clientY;
    const startRows = field.rows;
    setResizing('v');

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientY - startY;
      const rowDelta = Math.round(delta / rowHeight);
      const next = clamp(startRows + rowDelta, 1, 6);
      setPreviewRows(next);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      setResizing(null);
      setPreviewRows((finalRows) => {
        if (finalRows && finalRows !== field.rows) {
          onChange(field.with({ rows: finalRows }));
        }
        return null;
      });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Avoid stuck cursor if component unmounts mid-drag
  useEffect(() => {
    if (!resizing) return;
    document.body.style.cursor = resizing === 'h' ? 'ew-resize' : 'ns-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizing]);

  const isPresentational = meta.presentational;

  return (
    <div
      ref={(el) => { setNodeRef(el); tileRef.current = el; }}
      style={style}
      onClick={onSelect}
      className={[
        widthClassName(effectiveWidth),
        'ftx-tile',
        isPresentational ? 'ftx-tile-presentational' : '',
        selected ? 'ftx-tile-active' : '',
        isDragging ? 'opacity-90' : '',
      ].join(' ')}
    >
      <div className="ftx-tile-toolbar">
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="ftx-icon-btn cursor-grab active:cursor-grabbing"
          aria-label="Reordenar"
          title="Arrastrar para reordenar verticalmente"
        >
          <GripVertical size={12} />
        </button>

        <span className="ftx-chip-glyph !w-5 !h-5 !text-[10px] shrink-0">
          {meta.glyph}
        </span>

        <span className="text-[11px] font-medium text-ink truncate flex-1 min-w-0">
          {field.label || 'Sin etiqueta'}
          {field.required && <span className="text-brand ml-1">*</span>}
        </span>

        <span className="ftx-tile-coord hidden sm:inline-flex">
          {effectiveWidth}c · {effectiveRows}f
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="ftx-icon-btn ftx-icon-btn-danger"
          aria-label="Eliminar"
          title="Eliminar"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="px-3 py-2.5">
        <FieldRender field={field} compact />
      </div>

      {/* Resize handles */}
      <div
        onMouseDown={onResizeStart}
        className={['ftx-resize-handle', resizing === 'h' ? 'is-active' : ''].join(' ')}
        aria-label="Cambiar ancho"
        title="Arrastra para cambiar ancho"
      />
      <div
        onMouseDown={onResizeStartV}
        className={['ftx-resize-handle-v', resizing === 'v' ? 'is-active' : ''].join(' ')}
        aria-label="Cambiar alto"
        title="Arrastra para cambiar alto"
      />

      {(previewWidth !== null || previewRows !== null) && (
        <div className="ftx-resize-ghost">
          <span className="absolute top-1.5 right-1.5 ftx-tile-coord !text-brand !border-brand">
            {effectiveWidth}c · {effectiveRows}f
          </span>
        </div>
      )}
    </div>
  );
}

function clamp(n: number, min: number, max: number): number {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}
