import { TransformationDefinition } from '../../types';

export const canvasPadding: TransformationDefinition = {
    id: 'geometry-canvas-padding',
    name: 'Canvas Padding',
    description: 'Add padding around the image.',
    params: [
        {
            name: 'padding',
            label: 'Padding (px or %)',
            type: 'text',
            defaultValue: '10%'
        },
        {
            name: 'color',
            label: 'Background Color',
            type: 'color',
            defaultValue: '#ffffff'
        }
    ],
    apply: (ctx, params) => {
        const paddingStr = String(params.padding || '0');
        const color = params.color || '#ffffff';

        let padding = 0;
        if (paddingStr.endsWith('%')) {
            const pct = parseFloat(paddingStr) / 100;
            // Percentage of the smaller dimension? or average? usually relative to width or min dimension.
            // Let's use min dimension for consistency.
            padding = Math.min(ctx.canvas.width, ctx.canvas.height) * pct;
        } else {
            padding = parseFloat(paddingStr);
        }

        const oldWidth = ctx.canvas.width;
        const oldHeight = ctx.canvas.height;
        const newWidth = oldWidth + padding * 2;
        const newHeight = oldHeight + padding * 2;

        // Create temp canvas to hold current image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = oldWidth;
        tempCanvas.height = oldHeight;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        tempCtx.drawImage(ctx.canvas, 0, 0);

        // Resize main canvas
        ctx.canvas.width = newWidth;
        ctx.canvas.height = newHeight;

        // Fill background
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, newWidth, newHeight);

        // Draw original image centered
        ctx.drawImage(tempCanvas, padding, padding);
    }
};
