import { TransformationDefinition } from '../types';

export const caption: TransformationDefinition = {
    id: 'text-caption',
    name: 'Caption',
    description: 'Add a text caption',
    params: [
        { name: 'text', label: 'Text', type: 'text', defaultValue: 'Caption' },
        {
            name: 'position', label: 'Position', type: 'select', options: [
                { label: 'Top', value: 'top' },
                { label: 'Bottom', value: 'bottom' }
            ], defaultValue: 'bottom'
        },
        { name: 'fontSize', label: 'Font Size', type: 'number', defaultValue: 24 },
        { name: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#000000' },
        { name: 'textColor', label: 'Text Color', type: 'color', defaultValue: '#ffffff' },
    ],
    apply: (ctx, params, context) => {
        let { text, position, fontSize, backgroundColor, textColor } = params;

        // Replace placeholders
        if (context.filename) {
            text = text.replace('{{filename}}', context.filename);
        }

        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const padding = fontSize / 2;

        ctx.font = `${fontSize}px Inter, sans-serif`;
        const textMetrics = ctx.measureText(text);
        const textHeight = fontSize * 1.2; // Approximate height

        const barHeight = textHeight + padding * 2;
        let y = 0;
        if (position === 'bottom') {
            y = height - barHeight;
        }

        // Draw background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, y, width, barHeight);

        // Draw text
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, y + barHeight / 2);
    },
};

export const watermark: TransformationDefinition = {
    id: 'text-watermark',
    name: 'Watermark',
    description: 'Add repeated watermark',
    params: [
        { name: 'text', label: 'Text', type: 'text', defaultValue: 'Watermark' },
        { name: 'fontSize', label: 'Font Size', type: 'number', defaultValue: 24 },
        { name: 'opacity', label: 'Opacity', type: 'range', min: 0, max: 1, step: 0.1, defaultValue: 0.3 },
        { name: 'color', label: 'Color', type: 'color', defaultValue: '#000000' },
        { name: 'angle', label: 'Angle', type: 'range', min: -90, max: 90, defaultValue: -45 },
    ],
    apply: (ctx, params, context) => {
        let { text, fontSize, opacity, color, angle } = params;

        if (context.filename) {
            text = text.replace('{{filename}}', context.filename);
        }

        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px Inter, sans-serif`;

        // Calculate spacing
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const spacingX = textWidth * 2;
        const spacingY = fontSize * 3;

        // Rotate entire canvas context for drawing? No, better to rotate individual texts or rotate pattern.
        // Easiest is to loop and draw rotated text.

        // We need to cover the whole canvas, including rotation.
        // A simple way is to draw a grid.

        const diag = Math.sqrt(width * width + height * height);

        ctx.translate(width / 2, height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.translate(-diag, -diag);

        for (let y = 0; y < diag * 2; y += spacingY) {
            for (let x = 0; x < diag * 2; x += spacingX) {
                ctx.fillText(text, x + (y % (spacingY * 2) === 0 ? 0 : spacingX / 2), y);
            }
        }

        ctx.restore();
    },
};
