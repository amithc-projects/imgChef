import React, { useRef } from 'react';
import { Recipe, RecipeStep } from '../core/types';
import { transformationRegistry } from '../core/Registry';
import { Trash2, GripVertical, Save, FolderOpen, Eye, EyeOff, Power } from 'lucide-react';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RecipeEditorProps {
  recipe: Recipe;
  onUpdateStep: (stepId: string, params: any) => void;
  onRemoveStep: (stepId: string) => void;
  onReorderSteps: (startIndex: number, endIndex: number) => void;
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
  onSaveRecipe: () => void;
  onLoadRecipe: (recipe: Recipe) => void;
  // New props
  previewStepId: string | null;
  onPreviewStep: (stepId: string) => void;
  onToggleStep: (stepId: string) => void;
}

const SortableStepItem = ({
  step,
  selected,
  previewing,
  onSelect,
  onRemove,
  onPreview,
  onToggle
}: {
  step: RecipeStep,
  selected: boolean,
  previewing: boolean,
  onSelect: () => void,
  onRemove: (e: React.MouseEvent) => void,
  onPreview: (e: React.MouseEvent) => void,
  onToggle: (e: React.MouseEvent) => void
}) => {
  const def = transformationRegistry.get(step.transformationId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 'auto',
    opacity: isDragging ? 0.5 : (step.disabled ? 0.6 : 1),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`step-item ${selected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="step-handle" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </div>
      <div className="step-info">
        <span className="step-name" style={{ textDecoration: step.disabled ? 'line-through' : 'none' }}>
          {def?.name || step.transformationId}
        </span>
        <span className="step-desc">{def?.description}</span>
        {step.condition && (
          <span className="step-condition">
            IF {step.condition.field} {step.condition.operator} {step.condition.value}
          </span>
        )}
      </div>
      <div className="step-controls">
        <button
          className={`btn-icon action-btn ${previewing ? 'active' : ''}`}
          title={previewing ? "Show Full Result" : "Preview Up To Here"}
          onClick={onPreview}
        >
          {previewing ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button
          className={`btn-icon action-btn ${!step.disabled ? 'active-power' : ''}`}
          title={step.disabled ? "Enable Step" : "Disable Step"}
          onClick={onToggle}
        >
          <Power size={14} />
        </button>
        <button
          className="btn-icon delete-btn"
          title="Remove Step"
          onClick={onRemove}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export const RecipeEditor: React.FC<RecipeEditorProps> = ({
  recipe,
  onRemoveStep,
  selectedStepId,
  onSelectStep,
  onSaveRecipe,
  onLoadRecipe,
  onReorderSteps,
  previewStepId,
  onPreviewStep,
  onToggleStep
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = recipe.steps.findIndex((step) => step.id === active.id);
      const newIndex = recipe.steps.findIndex((step) => step.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderSteps(oldIndex, newIndex);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const loadedRecipe = JSON.parse(json);
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={recipe.steps.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {recipe.steps.map((step) => (
              <SortableStepItem
                key={step.id}
                step={step}
                selected={selectedStepId === step.id}
                previewing={previewStepId === step.id}
                onSelect={() => onSelectStep(step.id)}
                onPreview={(e) => {
                  e.stopPropagation();
                  onPreviewStep(step.id);
                }}
                onToggle={(e) => {
                  e.stopPropagation();
                  onToggleStep(step.id);
                }}
                onRemove={(e) => {
                  e.stopPropagation();
                  onRemoveStep(step.id);
                }}
              />
            ))}
          </SortableContext>
        </DndContext>

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
            padding-bottom: 40px; /* Space for scrolling */
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
            transition: all var(--transition-fast);
            touch-action: none; /* Important for DND on touch devices */
            position: relative;
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
            padding: 4px;
            display: flex;
            align-items: center;
        }
        .step-handle:active {
            cursor: grabbing;
        }
        .step-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 0; /* Text truncation */
        }
        .step-name {
            font-weight: 500;
            font-size: 0.9rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .step-desc {
            font-size: 0.75rem;
            color: var(--color-text-secondary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .step-condition {
            font-size: 0.7rem;
            color: var(--color-primary);
            margin-top: 2px;
        }
        .step-controls {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .btn-icon {
            padding: 4px;
            border-radius: 4px;
            background: transparent;
            border: none;
            color: var(--color-text-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .btn-icon:hover {
            background: var(--color-bg-tertiary);
            color: var(--color-text-primary);
        }
        .action-btn.active {
            color: var(--color-primary);
            background: rgba(59, 130, 246, 0.1);
        }
        .action-btn.active-power {
            color: var(--color-success);
        }
        .delete-btn:hover {
            color: var(--color-error);
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