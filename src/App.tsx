import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { LibrarySidebar } from './components/LibrarySidebar';
import { RecipeEditor } from './components/RecipeEditor';
import { TransformationControls } from './components/TransformationControls';
import { PreviewCanvas } from './components/PreviewCanvas';
import { BatchRunner } from './components/BatchRunner';
import { Recipe, RecipeStep } from './core/types';
import { registerAllTransformations } from './core/transformations';
import { transformationRegistry } from './core/Registry';
import { Upload, FolderInput } from 'lucide-react';

// Register transformations
registerAllTransformations();

function App() {
  const [recipe, setRecipe] = useState<Recipe>({
    id: 'default',
    name: 'My Recipe',
    steps: [],
  });
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);

  const handleAddStep = (transformationId: string) => {
    const def = transformationRegistry.get(transformationId);
    if (!def) return;

    const newStep: RecipeStep = {
      id: crypto.randomUUID(),
      transformationId,
      params: def.params.reduce((acc, param) => {
        acc[param.name] = param.defaultValue;
        return acc;
      }, {} as any),
    };

    setRecipe((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
    setSelectedStepId(newStep.id);
  };

  const handleRemoveStep = (stepId: string) => {
    setRecipe((prev) => ({
      ...prev,
      steps: prev.steps.filter((s) => s.id !== stepId),
    }));
    if (selectedStepId === stepId) {
      setSelectedStepId(null);
    }
  };

  const handleUpdateParams = (params: any) => {
    if (!selectedStepId) return;
    setRecipe((prev) => ({
      ...prev,
      steps: prev.steps.map((s) =>
        s.id === selectedStepId ? { ...s, params } : s
      ),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      img.onload = () => setOriginalImage(img);
      img.src = URL.createObjectURL(file);
    }
  };

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    setBatchFiles(imageFiles);

    // Auto-load first image for preview if none selected
    if (imageFiles.length > 0 && !originalImage) {
      const img = new Image();
      img.onload = () => setOriginalImage(img);
      img.src = URL.createObjectURL(imageFiles[0]);
    }
  };

  const selectedStep = recipe.steps.find((s) => s.id === selectedStepId) || null;

  return (
    <Layout>
      <LibrarySidebar onAddStep={handleAddStep} />
      <RecipeEditor
        recipe={recipe}
        onRemoveStep={handleRemoveStep}
        onUpdateStep={() => { }} // TODO: Implement reorder
        onReorderSteps={() => { }}
        selectedStepId={selectedStepId}
        onSelectStep={setSelectedStepId}
      />
      <div className="main-area">
        <div className="toolbar">
          <label className="btn btn-primary">
            <Upload size={16} style={{ marginRight: '8px' }} />
            Load Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </label>
          <label className="btn btn-primary" style={{ marginLeft: '8px' }}>
            <FolderInput size={16} style={{ marginRight: '8px' }} />
            Load Folder
            <input
              type="file"
              // @ts-ignore
              webkitdirectory=""
              directory=""
              onChange={handleFolderUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        <PreviewCanvas originalImage={originalImage} recipe={recipe} />
        {batchFiles.length > 0 && (
          <BatchRunner files={batchFiles} recipe={recipe} />
        )}
      </div>
      <TransformationControls
        step={selectedStep}
        onUpdateParams={handleUpdateParams}
      />
      <style>{`
        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .toolbar {
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          gap: var(--spacing-md);
        }
      `}</style>
    </Layout>
  );
}

export default App;
