import { TransformationDefinition } from '../types';
import { resolveVariables } from '../utils/variable_substitution';

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
        text = resolveVariables(text, context);

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

        text = resolveVariables(text, context);

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

export const advancedText: TransformationDefinition = {
    id: 'text-advanced',
    name: 'Rich Text',
    description: 'Advanced text with styling, positioning, and effects',
    params: [
        { name: 'text', label: 'Text', type: 'text', defaultValue: 'Hello World' },
        {
            name: 'fontFamily', label: 'Font Family', type: 'select', options: [
                { label: 'Inter', value: 'Inter' },
                { label: 'Arial', value: 'Arial' },
                { label: 'Times New Roman', value: 'Times New Roman' },
                { label: 'Courier New', value: 'Courier New' },
                { label: 'Georgia', value: 'Georgia' },
                { label: 'Verdana', value: 'Verdana' }
            ], defaultValue: 'Inter'
        },
        { name: 'fontSize', label: 'Font Size', type: 'number', defaultValue: 48 },
        {
            name: 'fontWeight', label: 'Weight', type: 'select', options: [
                { label: 'Normal', value: 'normal' },
                { label: 'Bold', value: 'bold' }
            ], defaultValue: 'normal'
        },
        {
            name: 'fontStyle', label: 'Style', type: 'select', options: [
                { label: 'Normal', value: 'normal' },
                { label: 'Italic', value: 'italic' }
            ], defaultValue: 'normal'
        },
        { name: 'color', label: 'Color', type: 'color', defaultValue: '#ffffff' },
        { name: 'x', label: 'X Position (%)', type: 'range', min: 0, max: 100, defaultValue: 50 },
        { name: 'y', label: 'Y Position (%)', type: 'range', min: 0, max: 100, defaultValue: 50 },
        {
            name: 'align', label: 'Align', type: 'select', options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' }
            ], defaultValue: 'center'
        },
        {
            name: 'baseline', label: 'Baseline', type: 'select', options: [
                { label: 'Top', value: 'top' },
                { label: 'Middle', value: 'middle' },
                { label: 'Bottom', value: 'bottom' }
            ], defaultValue: 'middle'
        },
        { name: 'shadowColor', label: 'Shadow Color', type: 'color', defaultValue: '#000000' },
        { name: 'shadowBlur', label: 'Shadow Blur', type: 'number', defaultValue: 0 },
        { name: 'shadowOffsetX', label: 'Shadow Offset X', type: 'number', defaultValue: 0 },
        { name: 'shadowOffsetY', label: 'Shadow Offset Y', type: 'number', defaultValue: 0 },
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
        },
        {
            name: 'mode', label: 'Mode', type: 'select', options: [
                { label: 'Standard', value: 'standard' },
                { label: 'Knockout (Cutout)', value: 'knockout' },
                { label: 'Mask (Image-in-Text)', value: 'mask' }
            ], defaultValue: 'standard'
        }
    ],
    apply: (ctx, params, context) => {
        let {
            text, fontFamily, fontSize, fontWeight, fontStyle, color,
            x, y, align, baseline,
            shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY,
            blendMode, mode
        } = params;

        text = resolveVariables(text, context);

        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        const posX = (x / 100) * width;
        const posY = (y / 100) * height;

        ctx.save();

        // Font settings
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}, sans-serif`;
        ctx.textAlign = align as CanvasTextAlign;
        ctx.textBaseline = baseline as CanvasTextBaseline;

        // Shadow settings
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;

        // Blend Mode
        ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;

        if (mode === 'knockout') {
            // Knockout: Text punches a hole in the image
            // To do this, we need to use destination-out, but that only works if we are drawing on a layer.
            // Since we are drawing directly on the canvas, we can use destination-out to erase.
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'black'; // Color doesn't matter for destination-out
            ctx.fillText(text, posX, posY);
        } else if (mode === 'mask') {
            // Mask: Image exists only inside the letters
            // This is 'destination-in'
            ctx.globalCompositeOperation = 'destination-in';
            ctx.fillStyle = 'black'; // Color doesn't matter
            ctx.fillText(text, posX, posY);
        } else {
            // Standard
            ctx.fillStyle = color;
            ctx.fillText(text, posX, posY);
        }

        ctx.restore();
    },
};
