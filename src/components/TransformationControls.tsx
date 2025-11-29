import React, { useState } from 'react';
import { RecipeStep, ParameterDefinition, Condition } from '../core/types';
import { transformationRegistry } from '../core/Registry';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TransformationControlsProps {
    step: RecipeStep | null;
    onUpdateParams: (params: any) => void;
    onUpdateCondition: (condition: Condition | undefined) => void;
}

export const TransformationControls: React.FC<TransformationControlsProps> = ({
    step,
    onUpdateParams,
    onUpdateCondition,
}) => {
    const [showCondition, setShowCondition] = useState(false);

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

    const handleConditionChange = (field: keyof Condition, value: any) => {
        const currentCondition = step.condition || { field: 'aspectRatio', operator: 'gt', value: 1 };
        const newCondition = { ...currentCondition, [field]: value };
        onUpdateCondition(newCondition);
    };

    const toggleCondition = () => {
        if (step.condition) {
            onUpdateCondition(undefined);
        } else {
            onUpdateCondition({ field: 'aspectRatio', operator: 'gt', value: 1 });
            setShowCondition(true);
        }
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

                <div className="condition-section">
                    <div className="condition-header" onClick={() => setShowCondition(!showCondition)}>
                        {showCondition ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span>Conditional Execution</span>
                        <input
                            type="checkbox"
                            checked={!!step.condition}
                            onChange={(e) => {
                                e.stopPropagation();
                                toggleCondition();
                            }}
                            style={{ marginLeft: 'auto' }}
                        />
                    </div>

                    {showCondition && step.condition && (
                        <div className="condition-body">
                            <div className="control-group">
                                <label>Field</label>
                                <select
                                    value={step.condition.field}
                                    onChange={(e) => handleConditionChange('field', e.target.value)}
                                >
                                    <option value="width">Width</option>
                                    <option value="height">Height</option>
                                    <option value="aspectRatio">Aspect Ratio</option>
                                    <option value="metadata.iso">ISO (Metadata)</option>
                                    <option value="metadata.make">Camera Make (Metadata)</option>
                                </select>
                            </div>
                            <div className="control-group">
                                <label>Operator</label>
                                <select
                                    value={step.condition.operator}
                                    onChange={(e) => handleConditionChange('operator', e.target.value)}
                                >
                                    <option value="eq">Equals (=)</option>
                                    <option value="neq">Not Equals (!=)</option>
                                    <option value="gt">Greater Than (&gt;)</option>
                                    <option value="lt">Less Than (&lt;)</option>
                                    <option value="gte">Greater/Equal (&gt;=)</option>
                                    <option value="lte">Less/Equal (&lt;=)</option>
                                    <option value="contains">Contains</option>
                                </select>
                            </div>
                            <div className="control-group">
                                <label>Value</label>
                                <input
                                    type="text"
                                    value={step.condition.value}
                                    onChange={(e) => handleConditionChange('value', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>
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
          margin-bottom: var(--spacing-md);
        }
        .condition-section {
            border-top: 1px solid var(--color-border);
            margin-top: var(--spacing-md);
            padding-top: var(--spacing-md);
        }
        .condition-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            cursor: pointer;
            font-weight: 500;
            margin-bottom: var(--spacing-sm);
            user-select: none;
        }
        .condition-body {
            padding-left: var(--spacing-md);
            border-left: 2px solid var(--color-border);
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
