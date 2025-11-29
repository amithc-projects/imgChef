import { TransformationDefinition } from '../../types';

const FONTS = [
    { label: 'Inter (Default)', value: 'Inter, sans-serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Times New Roman', value: '"Times New Roman", serif' },
    { label: 'Courier New', value: '"Courier New", monospace' },
    { label: 'Impact', value: 'Impact, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Comic Sans', value: '"Comic Sans MS", cursive' }
];

// Helper to replace placeholders
const resolveText = (text: string, context: any) => {
    let result = text;
    // Filename
    if (context.filename) {
        result = result.replace(/{{filename}}/g, context.filename);
    }
    // Metadata
    if (context.metadata) {
        Object.keys(context.metadata).forEach(key => {
            const val = context.metadata![key];
            // Only replace if value is string or number
            if (typeof val === 'string' || typeof val === 'number') {
                result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(val));
            }
        });
    }
    // Variables
    // (Variables are ImageData, not text, so we typically don't interpolate them into strings)
    return result;
};

export const textFill: TransformationDefinition = {
    id: 'creative-text-fill',
    name: 'Image in Text',
    description: 'Fill text characters with the image content.',
    params: [
        { name: 'text', label: 'Text', type: 'text', defaultValue: 'HELLO' },
        { name: 'font', label: 'Font', type: 'select', options: FONTS, defaultValue: 'Impact, sans-serif' },
        { name: 'fontSize', label: 'Font Size (px)', type: 'number', min: 10, max: 1000, defaultValue: 200 },
        { name: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#ffffff' },
        { name: 'autoFit', label: 'Auto-Fit Text', type: 'boolean', defaultValue: true }
    ],
    apply: (ctx, params, context) => {
        const text = resolveText(params.text || 'HELLO', context);
        const font = params.font || 'Impact, sans-serif';
        const fontSize = params.fontSize || 200;
        const bgColor = params.backgroundColor || '#ffffff';
        const autoFit = params.autoFit !== false;

        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        // 1. Save the current image (the "fill") to a pattern or temp canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        tempCtx.drawImage(ctx.canvas, 0, 0);

        // 2. Clear main canvas and fill with background color
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // 3. Setup Text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let finalFontSize = fontSize;
        if (autoFit) {
            // Simple auto-fit logic: scale down if wider than canvas
            ctx.font = `bold ${fontSize}px ${font}`;
            const metrics = ctx.measureText(text);
            const textWidth = metrics.width;
            if (textWidth > width * 0.9) {
                finalFontSize = fontSize * ((width * 0.9) / textWidth);
            }
        }
        ctx.font = `bold ${finalFontSize}px ${font}`;

        // 4. Draw Text using Composite Operation
        // We want the text to "mask" the image.

        // Save context state
        ctx.save();

        // Create a "hole" in the background color where the text is?
        // Actually, easier logic:
        // a. Clear canvas completely? No, we want bgColor.
        // Strategy: 
        // 1. Draw Background.
        // 2. Draw Text.
        // 3. Composite the Image *into* the Text.

        // Let's retry the composite approach on a clean slate to be safe.
        ctx.clearRect(0, 0, width, height);

        // Draw Text (Solid)
        ctx.fillStyle = '#000000'; // Color doesn't matter for masking
        ctx.fillText(text, width / 2, height / 2);

        // Composite: Source-In (Keep source (image) only where destination (text) exists)
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(tempCanvas, 0, 0);

        // Now we have the Text Filled with Image on a Transparent Background.
        // We need to put the Background Color *behind* it.
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        ctx.restore();
    }
};

export const textCutout: TransformationDefinition = {
    id: 'creative-text-cutout',
    name: 'Text Cutout',
    description: 'Cut text out of the image (Knockout).',
    params: [
        { name: 'text', label: 'Text', type: 'text', defaultValue: 'MASK' },
        { name: 'font', label: 'Font', type: 'select', options: FONTS, defaultValue: 'Impact, sans-serif' },
        { name: 'fontSize', label: 'Font Size (px)', type: 'number', min: 10, max: 1000, defaultValue: 200 },
        { name: 'fillColor', label: 'Cutout Fill Color', type: 'color', defaultValue: '#ffffff' },
        { name: 'isTransparent', label: 'Make Transparent', type: 'boolean', defaultValue: false },
        { name: 'autoFit', label: 'Auto-Fit Text', type: 'boolean', defaultValue: true }
    ],
    apply: (ctx, params, context) => {
        const text = resolveText(params.text || 'MASK', context);
        const font = params.font || 'Impact, sans-serif';
        const fontSize = params.fontSize || 200;
        const fillColor = params.fillColor || '#ffffff';
        const isTransparent = params.isTransparent || false;
        const autoFit = params.autoFit !== false;

        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let finalFontSize = fontSize;
        if (autoFit) {
            ctx.font = `bold ${fontSize}px ${font}`;
            const metrics = ctx.measureText(text);
            const textWidth = metrics.width;
            if (textWidth > width * 0.9) {
                finalFontSize = fontSize * ((width * 0.9) / textWidth);
            }
        }
        ctx.font = `bold ${finalFontSize}px ${font}`;

        ctx.save();

        if (isTransparent) {
            // Cut a hole (Transparency)
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = '#000000'; // Color irrelevant, alpha matters (1.0)
            ctx.fillText(text, width / 2, height / 2);
        } else {
            // Fill with specific color (Standard drawing on top)
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = fillColor;
            ctx.fillText(text, width / 2, height / 2);
        }

        ctx.restore();
    }
};