import React, { useEffect, useRef, useState } from 'react';
import { Recipe } from '../core/types';
import { imageProcessor } from '../core/Processor';
import { Loader2 } from 'lucide-react';

interface PreviewCanvasProps {
    originalImage: HTMLImageElement | null;
    recipe: Recipe;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
    originalImage,
    recipe,
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Debounce processing
    useEffect(() => {
        if (!originalImage) {
            setPreviewUrl(null);
            return;
        }

        const process = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = await imageProcessor.processToDataUrl(originalImage, recipe, {
                    originalImage,
                    filename: 'preview.jpg',
                });
                setPreviewUrl(url);
            } catch (err) {
                console.error(err);
                setError('Failed to process image');
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(process, 500);
        return () => clearTimeout(timer);
    }, [originalImage, recipe]);

    // Cleanup URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    if (!originalImage) {
        return (
            <div className="preview-empty">
                <p>Select an image to preview the recipe</p>
            </div>
        );
    }

    return (
        <div className="preview-canvas">
            {loading && (
                <div className="preview-loading">
                    <Loader2 className="animate-spin" size={32} />
                </div>
            )}
            {error && <div className="preview-error">{error}</div>}
            {previewUrl && (
                <img src={previewUrl} alt="Preview" className="preview-image" />
            )}
            <style>{`
        .preview-canvas {
          flex: 1;
          background: var(--color-bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          padding: var(--spacing-md);
        }
        .preview-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          background: var(--color-bg-tertiary);
        }
        .preview-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .preview-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: var(--color-primary);
          background: rgba(0, 0, 0, 0.5);
          padding: var(--spacing-md);
          border-radius: var(--radius-full);
        }
        .preview-error {
          position: absolute;
          bottom: var(--spacing-md);
          left: 50%;
          transform: translateX(-50%);
          background: var(--color-error);
          color: white;
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};
