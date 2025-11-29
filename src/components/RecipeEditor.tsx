import React, { useRef } from 'react';
import { Recipe, RecipeStep } from '../core/types';
import { transformationRegistry } from '../core/Registry';
import { Trash2, GripVertical, Save, FolderOpen } from 'lucide-react';

interface RecipeEditorProps {
  recipe: Recipe;
  onUpdateStep: (stepId: string, params: any) => void;
  onRemoveStep: (stepId: string) => void;
  onReorderSteps: (startIndex: number, endIndex: number) => void;
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
  onSaveRecipe: () => void;
  onLoadRecipe: (recipe: Recipe) => void;
}

export const RecipeEditor: React.FC<RecipeEditorProps> = ({
  recipe,
  onRemoveStep,
  selectedStepId,
  onSelectStep,
  onSaveRecipe,
  onLoadRecipe,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const loadedRecipe = JSON.parse(json);
        // Validate basic structure
        if (loadedRecipe.steps && Array.isArray(loadedRecipe.steps)) {
          onLoadRecipe(loadedRecipe);
        } else {
          alert('Invalid recipe file');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to parse recipe file');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="recipe-editor">
      <div className="recipe-header">
        <h3>Recipe Steps</h3>
        <div className="recipe-actions">
          <button className="btn-icon" title="Save Recipe" onClick={onSaveRecipe}>
            <Save size={16} />
          </button>
          <button className="btn-icon" title="Load Recipe" onClick={() => fileInputRef.current?.click()}>
            <FolderOpen size={16} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json"
            onChange={handleFileChange}
          />
        </div>
      </div>
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
                {step.condition && (
                  <span className="step-condition">
                    IF {step.condition.field} {step.condition.operator} {step.condition.value}
                  </span>
                )}
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
        .recipe-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--spacing-md);
            border-bottom: 1px solid var(--color-border);
        }
        .recipe-header h3 {
          margin: 0;
          font-size: 1rem;
        }
        .recipe-actions {
            display: flex;
            gap: var(--spacing-sm);
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
        .step-condition {
            font-size: 0.7rem;
            color: var(--color-primary);
            margin-top: 2px;
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
