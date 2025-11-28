import React from 'react';
import { Recipe, RecipeStep } from '../core/types';
import { transformationRegistry } from '../core/Registry';
import { Trash2, GripVertical } from 'lucide-react';

interface RecipeEditorProps {
    recipe: Recipe;
    onUpdateStep: (stepId: string, params: any) => void;
    onRemoveStep: (stepId: string) => void;
    onReorderSteps: (startIndex: number, endIndex: number) => void;
    selectedStepId: string | null;
    onSelectStep: (stepId: string) => void;
}

export const RecipeEditor: React.FC<RecipeEditorProps> = ({
    recipe,
    onRemoveStep,
    selectedStepId,
    onSelectStep,
}) => {
    return (
        <div className="recipe-editor">
            <h3>Recipe Steps</h3>
            <div className="steps-list">
                {recipe.steps.map((step, index) => {
                    const def = transformationRegistry.get(step.transformationId);
                    return (
                        <div
                            key={step.id}
                            className={`step-item ${selectedStepId === step.id ? 'selected' : ''}`}
                            onClick={() => onSelectStep(step.id)}
                        >
                            <div className="step-handle">
                                <GripVertical size={16} />
                            </div>
                            <div className="step-info">
                                <span className="step-name">{def?.name || step.transformationId}</span>
                                <span className="step-desc">{def?.description}</span>
                            </div>
                            <button
                                className="btn-icon delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveStep(step.id);
                                }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    );
                })}
                {recipe.steps.length === 0 && (
                    <div className="empty-state">No steps in this recipe. Add one below!</div>
                )}
            </div>
            <style>{`
        .recipe-editor {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--color-bg-secondary);
          border-right: 1px solid var(--color-border);
          width: 300px;
        }
        .recipe-editor h3 {
          padding: var(--spacing-md);
          margin: 0;
          border-bottom: 1px solid var(--color-border);
          font-size: 1rem;
        }
        .steps-list {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-sm);
        }
        .step-item {
          display: flex;
          align-items: center;
          padding: var(--spacing-sm);
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-sm);
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }
        .step-item:hover {
          border-color: var(--color-primary);
        }
        .step-item.selected {
          border-color: var(--color-primary);
          background: var(--color-bg-tertiary);
        }
        .step-handle {
          color: var(--color-text-secondary);
          margin-right: var(--spacing-sm);
          cursor: grab;
        }
        .step-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .step-name {
          font-weight: 500;
          font-size: 0.9rem;
        }
        .step-desc {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
        }
        .delete-btn {
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        .step-item:hover .delete-btn {
          opacity: 1;
        }
        .empty-state {
          padding: var(--spacing-xl);
          text-align: center;
          color: var(--color-text-secondary);
          font-size: 0.9rem;
        }
      `}</style>
        </div>
    );
};
