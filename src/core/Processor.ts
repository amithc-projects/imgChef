import { Recipe, TransformationContext } from './types';
import { transformationRegistry } from './Registry';

export class ImageProcessor {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor() {
        this.canvas = document.createElement('canvas');
        const ctx = this.canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        this.ctx = ctx;
    }

    async process(image: HTMLImageElement, recipe: Recipe, context: TransformationContext): Promise<{ blob: Blob; filename: string }[]> {
        // Reset canvas to image size
        this.canvas.width = image.naturalWidth;
        this.canvas.height = image.naturalHeight;

        // Draw initial image
        this.ctx.drawImage(image, 0, 0);

        const results: { blob: Blob; filename: string }[] = [];

        // Apply steps
        for (const step of recipe.steps) {
            if (step.transformationId === 'workflow-export') {
                const suffix = step.params.suffix || '';
                const format = step.params.format || 'image/jpeg';

                const blob = await new Promise<Blob | null>((resolve) => {
                    this.canvas.toBlob((b) => resolve(b), format, 0.95);
                });

                if (blob) {
                    const nameParts = context.filename.split('.');
                    const ext = nameParts.pop();
                    const base = nameParts.join('.');
                    const newExt = format.split('/')[1];
                    results.push({
                        blob,
                        filename: `${base}${suffix}.${newExt}`
                    });
                }
                continue;
            }

            const transformation = transformationRegistry.get(step.transformationId);
            if (transformation) {
                await transformation.apply(this.ctx, step.params, context);
            } else {
                console.warn(`Transformation ${step.transformationId} not found`);
            }
        }

        // Always export the final state if no explicit exports were made, or if we want the final result too?
        // User requirement: "save it once as a grayscale image _gray.png and then do other transformations and save it again as _thumb.png"
        // This implies explicit saves. But usually users expect the final result.
        // Let's say if there are NO export steps, return the final result.
        // If there ARE export steps, only return those? Or always return final?
        // Let's assume if explicit exports exist, we rely on them. 
        // BUT, if the user just has a simple recipe without export steps, they expect a result.

        const hasExports = recipe.steps.some(s => s.transformationId === 'workflow-export');

        if (!hasExports) {
            const blob = await new Promise<Blob | null>((resolve) => {
                this.canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.95);
            });
            if (blob) {
                results.push({ blob, filename: context.filename });
            }
        }

        return results;
    }

    // Helper to get Data URL for preview
    async processToDataUrl(image: HTMLImageElement, recipe: Recipe, context: TransformationContext): Promise<string> {
        const results = await this.process(image, recipe, context);
        if (results.length > 0) {
            // Return the LAST result for preview? Or the one that matches the final state?
            // The preview should probably show the FINAL state of the canvas, not necessarily the exported files.
            // But process() modifies the canvas.
            // So the canvas is at the final state.
            // We can just grab the blob from the canvas directly here.

            return new Promise((resolve) => {
                this.canvas.toBlob((blob) => {
                    if (blob) resolve(URL.createObjectURL(blob));
                    else resolve('');
                }, 'image/jpeg', 0.95);
            });
        }
        return '';
    }
}


export const imageProcessor = new ImageProcessor();
