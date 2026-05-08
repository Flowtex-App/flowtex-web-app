import { useEffect, useMemo, useState } from 'react';
import {
  CHOICE_TYPES, NUMERIC_TYPES, NON_VALUE_TYPES, operatorsForField,
  type CustomCondition, type FormContext,
} from '../../domain/models/FormContext';

interface Props {
  context: FormContext;
  /** JSON string de la condición persistida (lo que viaja al backend). */
  value: string | null;
  onChange: (jsonString: string | null) => void;
}

/**
 * Constructor visual de condiciones CUSTOM.
 *
 * En lugar de pedir al usuario que escriba JSON, ofrece tres dropdowns:
 *   field    → seleccionado de los fieldKeys del formulario
 *   operator → operadores válidos para el tipo de ese campo
 *   value    → si el campo es SELECT/RADIO, dropdown de sus options;
 *              si es NUMBER, input numérico;
 *              si es texto, input libre.
 *
 * Lo serializa a JSON `{"field":"x","operator":"EQUALS","value":"y"}` que el
 * `WorkflowEngine` del backend interpreta directamente.
 */
export function CustomConditionBuilder({ context, value, onChange }: Props) {
  const fields = useMemo(
    () => context.fields.filter((f) => !NON_VALUE_TYPES.has(f.fieldType)),
    [context],
  );

  const initial = useMemo<CustomCondition | null>(() => {
    if (!value) return null;
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && parsed.field && parsed.operator) {
        return parsed as CustomCondition;
      }
    } catch {
      /* ignore */
    }
    return null;
  }, [value]);

  const [field, setField] = useState<string>(initial?.field ?? '');
  const [operator, setOperator] = useState<string>(initial?.operator ?? 'EQUALS');
  const [val, setVal] = useState<string>(
    initial?.value != null ? String(initial.value) : '',
  );

  const selectedField = useMemo(
    () => fields.find((f) => f.fieldKey === field),
    [fields, field],
  );

  // Cuando cambia el field, ajusta operator si el actual no aplica
  useEffect(() => {
    if (!selectedField) return;
    const ops = operatorsForField(selectedField.fieldType).map((o) => o.id);
    if (!ops.includes(operator as never)) {
      setOperator(ops[0] ?? 'EQUALS');
    }
    // Si el field tiene options cerradas, recortar value a una opción válida
    if (selectedField.options && !selectedField.options.includes(val)) {
      setVal('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedField?.fieldKey]);

  // Emite cambios al parent
  useEffect(() => {
    if (!field || !operator) {
      onChange(null);
      return;
    }
    const condition: CustomCondition = {
      field,
      operator,
      value: parseValue(val, selectedField?.fieldType),
    };
    onChange(JSON.stringify(condition));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field, operator, val, selectedField?.fieldType]);

  const opsForField = operatorsForField(selectedField?.fieldType);

  if (fields.length === 0) {
    return (
      <div className="px-3 py-3 rounded text-[11px] text-muted italic"
           style={{ background: 'var(--ftx-cream)', border: '1px dashed var(--ftx-line-strong)' }}>
        Este formulario aún no tiene campos con valor capturable. Agrega al menos un
        campo (texto, número, lista, etc.) para definir condiciones.
      </div>
    );
  }

  return (
    <div
      className="px-3 py-3 rounded space-y-2"
      style={{ background: 'var(--ftx-cream)', border: '1px solid var(--ftx-line-strong)' }}
    >
      <div className="font-mono text-[9px] uppercase tracking-widest text-muted">
        si en el formulario...
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1.2fr_1.4fr] gap-2">
        <SelectFancy
          label="campo"
          value={field}
          onChange={setField}
          options={fields.map((f) => ({
            id: f.fieldKey,
            label: f.label,
            hint: f.fieldKey,
          }))}
          placeholder="Elegir campo..."
        />
        <SelectFancy
          label="operador"
          value={operator}
          onChange={setOperator}
          options={opsForField.map((o) => ({ id: o.id, label: o.label }))}
          disabled={!selectedField}
        />
        <ValueInput
          fieldType={selectedField?.fieldType}
          options={selectedField?.options}
          value={val}
          onChange={setVal}
          disabled={!selectedField}
        />
      </div>

      {selectedField && (
        <div className="text-[10px] text-muted leading-snug">
          Esta transición se tomará cuando el campo
          {' '}<span className="font-mono text-ink">{selectedField.label}</span>
          {' '}{operatorLabel(operator)}
          {' '}<span className="font-mono text-ink">{val || '...'}</span>.
        </div>
      )}
    </div>
  );
}

function ValueInput({
  fieldType, options, value, onChange, disabled,
}: {
  fieldType: string | undefined;
  options: string[] | undefined;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  // Lista cerrada → dropdown
  if (fieldType && (CHOICE_TYPES.has(fieldType)) && options && options.length > 0) {
    return (
      <SelectFancy
        label="valor"
        value={value}
        onChange={onChange}
        options={options.map((o) => ({ id: o, label: o }))}
        disabled={disabled}
        placeholder="Elegir opción..."
      />
    );
  }

  const inputType = fieldType && NUMERIC_TYPES.has(fieldType)
    ? (fieldType === 'DATE' ? 'date' : fieldType === 'DATETIME' ? 'datetime-local' : 'number')
    : 'text';

  return (
    <label className="block">
      <span className="font-mono text-[9px] uppercase tracking-widest text-muted block mb-1">
        valor
      </span>
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={inputType === 'number' ? '0' : 'valor'}
        className="ftx-input-flat !text-[12px]"
      />
    </label>
  );
}

function SelectFancy({
  label, value, onChange, options, disabled, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string; hint?: string }[];
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[9px] uppercase tracking-widest text-muted block mb-1">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="ftx-input-flat !text-[12px]"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}{o.hint ? `  ·  ${o.hint}` : ''}
          </option>
        ))}
      </select>
    </label>
  );
}

function parseValue(raw: string, fieldType: string | undefined): string | number {
  if (!raw) return '';
  if (fieldType === 'NUMBER') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : raw;
  }
  return raw;
}

function operatorLabel(id: string): string {
  switch (id) {
    case 'EQUALS':     return 'sea igual a';
    case 'NOT_EQUALS': return 'sea distinto de';
    case 'CONTAINS':   return 'contenga';
    case 'GT':         return 'sea mayor que';
    case 'LT':         return 'sea menor que';
    case 'GTE':        return 'sea mayor o igual a';
    case 'LTE':        return 'sea menor o igual a';
    default:           return id;
  }
}
