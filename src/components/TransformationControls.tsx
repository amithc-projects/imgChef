import React from 'react';
import { RecipeStep, ParameterDefinition } from '../core/types';
import { transformationRegistry } from '../core/Registry';

interface TransformationControlsProps {
    step: RecipeStep | null;
    onUpdateParams: (params: any) => void;
}

export const TransformationControls: React.FC<TransformationControlsProps> = ({
    step,
    onUpdateParams,
}) => {
    if (!step) {
        return (
            <div className="controls-empty">
                Select a step to edit its parameters.
            </div>
        );
    }

    const def = transformationRegistry.get(step.transformationId);
    if (!def) return null;

    const handleChange = (key: string, value: any) => {
        onUpdateParams({ ...step.params, [key]: value });
    };

    return (
        <div className="transformation-controls">
            <h3>{def.name} Settings</h3>
            <div className="controls-form">
                {def.params.map((param) => (
                    <div key={param.name} className="control-group">
                        <label>{param.label}</label>
                        {renderInput(param, step.params[param.name] ?? param.defaultValue, handleChange)}
                    </div>
                ))}
                {def.params.length === 0 && (
                    <div className="no-params">No parameters for this transformation.</div>
                )}
            </div>
            <style>{`
        .transformation-controls {
          width: 300px;
          background: var(--color-bg-secondary);
          border-left: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
        }
        .transformation-controls h3 {
          padding: var(--spacing-md);
          margin: 0;
          border-bottom: 1px solid var(--color-border);
          font-size: 1rem;
        }
        .controls-form {
          padding: var(--spacing-md);
          overflow-y: auto;
          flex: 1;
        }
        .control-group {
          margin-bottom: var(--spacing-md);
        }
        .control-group label {
          display: block;
          margin-bottom: var(--spacing-xs);
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }
        .controls-empty {
          width: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          background: var(--color-bg-secondary);
          border-left: 1px solid var(--color-border);
          padding: var(--spacing-xl);
          text-align: center;
        }
        input[type="text"],
        input[type="number"],
        select {
          width: 100%;
          padding: var(--spacing-sm);
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-primary);
        }
        input[type="range"] {
          width: 100%;
        }
        .no-params {
          color: var(--color-text-secondary);
          font-style: italic;
        }
      `}</style>
        </div>
    );
};

function renderInput(
    param: ParameterDefinition,
    value: any,
    onChange: (key: string, value: any) => void
) {
    switch (param.type) {
        case 'text':
            return (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(param.name, e.target.value)}
                />
            );
        case 'number':
            return (
                <input
                    type="number"
                    value={value}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    onChange={(e) => onChange(param.name, parseFloat(e.target.value))}
                />
            );
        case 'boolean':
            return (
                <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => onChange(param.name, e.target.checked)}
                />
            );
        case 'select':
            return (
                <select value={value} onChange={(e) => onChange(param.name, e.target.value)}>
                    {param.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            );
        case 'color':
            return (
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(param.name, e.target.value)}
                    style={{ width: '100%', height: '40px' }}
                />
            );
        case 'range':
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={value}
                        onChange={(e) => onChange(param.name, parseFloat(e.target.value))}
                    />
                    <span style={{ minWidth: '30px', textAlign: 'right', fontSize: '0.8rem' }}>{value}</span>
                </div>
            );
        default:
            return null;
    }
}
