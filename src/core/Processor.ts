import { Recipe, TransformationContext, Condition } from './types';
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

    private evaluateCondition(condition: Condition, context: TransformationContext, canvas: HTMLCanvasElement): boolean {
        let value: any;

        // Resolve field value
        if (condition.field === 'width') value = canvas.width;
        else if (condition.field === 'height') value = canvas.height;
        else if (condition.field === 'aspectRatio') value = canvas.width / canvas.height;
        else if (condition.field.startsWith('metadata.')) {
            const key = condition.field.split('.')[1];
            value = context.metadata?.[key];
        } else {
            return false; // Unknown field
        }

        // Compare
        switch (condition.operator) {
            case 'eq': return value == condition.value;
            case 'neq': return value != condition.value;
            case 'gt': return value > condition.value;
            case 'lt': return value < condition.value;
            case 'gte': return value >= condition.value;
            case 'lte': return value <= condition.value;
            case 'contains': return String(value).includes(String(condition.value));
            default: return false;
        }
    }

    async process(
        image: HTMLImageElement,
        recipe: Recipe,
        context: TransformationContext,
        stopAfterStepIndex?: number
    ): Promise<{ blob: Blob; filename: string }[]> {
        // Reset canvas to image size
        this.canvas.width = image.naturalWidth;
        this.canvas.height = image.naturalHeight;

        // Draw initial image
        this.ctx.drawImage(image, 0, 0);

        // Initialize variables if not present (though caller should usually provide)
        if (!context.variables) {
            context.variables = new Map();
        }

        const results: { blob: Blob; filename: string }[] = [];

        // Apply steps
        for (let i = 0; i < recipe.steps.length; i++) {
            const step = recipe.steps[i];

            // Check if disabled
            if (step.disabled) {
                // Even if disabled, we still respect the stop index loop
                if (stopAfterStepIndex !== undefined && i === stopAfterStepIndex) {
                    break;
                }
                continue;
            }

            // Check condition
            if (step.condition) {
                if (!this.evaluateCondition(step.condition, context, this.canvas)) {
                    continue;
                }
            }

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
                // Don't continue here, we might want to do more steps after export
            } else {
                const transformation = transformationRegistry.get(step.transformationId);
                if (transformation) {
                    await transformation.apply(this.ctx, step.params, context);
                } else {
                    console.warn(`Transformation ${step.transformationId} not found`);
                }
            }

            // Stop if we reached the requested step index (for partial preview)
            if (stopAfterStepIndex !== undefined && i === stopAfterStepIndex) {
                break;
            }
        }

        // If we stopped early, we probably just want the current state
        if (stopAfterStepIndex !== undefined) {
            // For partial preview, we don't return exports usually, just the canvas state is used by processToDataUrl
            // But if process() is called directly, maybe we return what we have?
            // Let's stick to the logic: process() returns files.
            // If stopped early, maybe no files are generated yet?
            // If the user wants to see the preview, they use processToDataUrl.
        }

        const hasExports = recipe.steps.some(s => s.transformationId === 'workflow-export');

        // If no exports defined, or if we stopped early (and thus might have skipped exports),
        // we might want to return the current state.
        // But for batch processing, we usually run the whole recipe.
        // For preview, we use processToDataUrl.

        if (!hasExports && stopAfterStepIndex === undefined) {
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
    async processToDataUrl(
        image: HTMLImageElement,
        recipe: Recipe,
        context: TransformationContext,
        stopAfterStepIndex?: number
    ): Promise<string> {
        // We call process mainly to run the side effects on the canvas
        await this.process(image, recipe, context, stopAfterStepIndex);

        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                if (blob) resolve(URL.createObjectURL(blob));
                else resolve('');
            }, 'image/jpeg', 0.95);
        });
    }
}


export const imageProcessor = new ImageProcessor();
