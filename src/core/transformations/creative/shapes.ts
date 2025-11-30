import { TransformationDefinition } from '../../types';

export const shapeOverlay: TransformationDefinition = {
    id: 'creative-shape-overlay',
    name: 'Shape Overlay',
    description: 'Add geometric shapes with blend modes',
    params: [
        {
            name: 'type', label: 'Shape', type: 'select', options: [
                { label: 'Rectangle', value: 'rectangle' },
                { label: 'Circle', value: 'circle' },
                { label: 'Ellipse', value: 'ellipse' }
            ], defaultValue: 'rectangle'
        },
        { name: 'color', label: 'Color', type: 'color', defaultValue: '#ff0000' },
        { name: 'opacity', label: 'Opacity', type: 'range', min: 0, max: 1, step: 0.1, defaultValue: 0.5 },
        { name: 'x', label: 'X Position (%)', type: 'range', min: 0, max: 100, defaultValue: 50 },
        { name: 'y', label: 'Y Position (%)', type: 'range', min: 0, max: 100, defaultValue: 50 },
        { name: 'width', label: 'Width (px)', type: 'number', defaultValue: 200 },
        { name: 'height', label: 'Height (px)', type: 'number', defaultValue: 200 },
        {
            name: 'blendMode', label: 'Blend Mode', type: 'select', options: [
                { label: 'Normal', value: 'source-over' },
                { label: 'Multiply', value: 'multiply' },
                { label: 'Screen', value: 'screen' },
                { label: 'Overlay', value: 'overlay' },
                { label: 'Darken', value: 'darken' },
                { label: 'Lighten', value: 'lighten' },
                { label: 'Color Dodge', value: 'color-dodge' },
                { label: 'Color Burn', value: 'color-burn' },
                { label: 'Hard Light', value: 'hard-light' },
                { label: 'Soft Light', value: 'soft-light' },
                { label: 'Difference', value: 'difference' },
                { label: 'Exclusion', value: 'exclusion' }
            ], defaultValue: 'source-over'
        }
    ],
    apply: (ctx, params, context) => {
        const { type, color, opacity, x, y, width: w, height: h, blendMode } = params;

        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        const posX = (x / 100) * canvasWidth;
        const posY = (y / 100) * canvasHeight;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;
        ctx.fillStyle = color;

        ctx.beginPath();
        if (type === 'rectangle') {
            // Draw centered
            ctx.rect(posX - w / 2, posY - h / 2, w, h);
        } else if (type === 'circle') {
            const radius = Math.min(w, h) / 2;
            ctx.arc(posX, posY, radius, 0, 2 * Math.PI);
        } else if (type === 'ellipse') {
            ctx.ellipse(posX, posY, w / 2, h / 2, 0, 0, 2 * Math.PI);
        }
        ctx.fill();

        ctx.restore();
    },
};
