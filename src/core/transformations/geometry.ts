import { TransformationDefinition } from '../types';

const parseValue = (val: string | number, ref: number): number => {
    const str = String(val);
    if (str.endsWith('%')) {
        return (parseFloat(str) / 100) * ref;
    }
    return parseFloat(str);
};

export const resize: TransformationDefinition = {
    id: 'geo-resize',
    name: 'Resize',
    description: 'Resize the image',
    params: [
        { name: 'width', label: 'Width (px or %)', type: 'text', defaultValue: '100%' },
        { name: 'height', label: 'Height (px or %)', type: 'text', defaultValue: '' },
        { name: 'maintainAspect', label: 'Maintain Aspect Ratio', type: 'boolean', defaultValue: true },
    ],
    apply: (ctx, params) => {
        const { width, height, maintainAspect } = params;

        let newWidth = ctx.canvas.width;
        let newHeight = ctx.canvas.height;

        if (width) newWidth = parseValue(width, ctx.canvas.width);
        if (height) newHeight = parseValue(height, ctx.canvas.height);

        if (maintainAspect) {
            const aspect = ctx.canvas.width / ctx.canvas.height;
            if (width && !height) {
                newHeight = newWidth / aspect;
            } else if (height && !width) {
                newWidth = newHeight * aspect;
            }
        }

        // We need to create a temporary canvas to hold the resized image
        // because changing canvas size clears it
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCtx.drawImage(ctx.canvas, 0, 0, newWidth, newHeight);

        // Update main canvas size and draw result
        ctx.canvas.width = newWidth;
        ctx.canvas.height = newHeight;
        ctx.drawImage(tempCanvas, 0, 0);
    },
};

export const crop: TransformationDefinition = {
    id: 'geo-crop',
    name: 'Crop',
    description: 'Crop the image',
    params: [
        { name: 'x', label: 'X (px or %)', type: 'text', defaultValue: '0' },
        { name: 'y', label: 'Y (px or %)', type: 'text', defaultValue: '0' },
        { name: 'width', label: 'Width (px or %)', type: 'text', defaultValue: '100%' },
        { name: 'height', label: 'Height (px or %)', type: 'text', defaultValue: '100%' },
    ],
    apply: (ctx, params) => {
        const { x: xVal, y: yVal, width: wVal, height: hVal } = params;

        const x = parseValue(xVal || 0, ctx.canvas.width);
        const y = parseValue(yVal || 0, ctx.canvas.height);
        const width = parseValue(wVal || ctx.canvas.width, ctx.canvas.width);
        const height = parseValue(hVal || ctx.canvas.height, ctx.canvas.height);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCtx.drawImage(ctx.canvas, x, y, width, height, 0, 0, width, height);

        ctx.canvas.width = width;
        ctx.canvas.height = height;
        ctx.drawImage(tempCanvas, 0, 0);
    },
};

export const flip: TransformationDefinition = {
    id: 'geo-flip',
    name: 'Flip',
    description: 'Flip the image',
    params: [
        {
            name: 'direction', label: 'Direction', type: 'select', options: [
                { label: 'Horizontal', value: 'horizontal' },
                { label: 'Vertical', value: 'vertical' },
                { label: 'Both', value: 'both' }
            ], defaultValue: 'horizontal'
        },
    ],
    apply: (ctx, params) => {
        const { direction } = params;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCtx.drawImage(ctx.canvas, 0, 0);

        ctx.save();
        ctx.clearRect(0, 0, width, height);

        if (direction === 'horizontal' || direction === 'both') {
            ctx.scale(-1, 1);
            ctx.translate(-width, 0);
        }
        if (direction === 'vertical' || direction === 'both') {
            ctx.scale(1, -1);
            ctx.translate(0, -height);
        }

        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
    },
};

export const rotate: TransformationDefinition = {
    id: 'geo-rotate',
    name: 'Rotate',
    description: 'Rotate the image',
    params: [
        {
            name: 'angle', label: 'Angle', type: 'select', options: [
                { label: '90° CW', value: 90 },
                { label: '180°', value: 180 },
                { label: '90° CCW', value: -90 }
            ], defaultValue: 90
        },
    ],
    apply: (ctx, params) => {
        const angle = params.angle || 0;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        tempCtx.drawImage(ctx.canvas, 0, 0);

        if (Math.abs(angle) === 90) {
            ctx.canvas.width = height;
            ctx.canvas.height = width;
        } else {
            ctx.canvas.width = width;
            ctx.canvas.height = height;
        }

        ctx.save();
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.drawImage(tempCanvas, -width / 2, -height / 2);
        ctx.restore();
    },
};

export const roundCorners: TransformationDefinition = {
    id: 'geo-round',
    name: 'Round Corners',
    description: 'Round corners or make circular',
    params: [
        { name: 'radius', label: 'Radius (px or %)', type: 'text', defaultValue: '20' },
        { name: 'circular', label: 'Make Circular', type: 'boolean', defaultValue: false },
    ],
    apply: (ctx, params) => {
        const { radius: rVal, circular } = params;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        const radius = parseValue(rVal || 20, Math.min(width, height));

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        tempCtx.drawImage(ctx.canvas, 0, 0);

        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.beginPath();

        if (circular) {
            const size = Math.min(width, height);
            ctx.arc(width / 2, height / 2, size / 2, 0, Math.PI * 2);
        } else {
            ctx.roundRect(0, 0, width, height, radius);
        }

        ctx.clip();
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
    },
};

export const border: TransformationDefinition = {
    id: 'geo-border',
    name: 'Border',
    description: 'Add a border around the image',
    params: [
        { name: 'size', label: 'Size (px or %)', type: 'text', defaultValue: '20' },
        { name: 'color', label: 'Color', type: 'color', defaultValue: '#ffffff' },
    ],
    apply: (ctx, params) => {
        const { size: sVal, color } = params;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        const size = parseValue(sVal || 20, Math.min(width, height));

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        tempCtx.drawImage(ctx.canvas, 0, 0);

        const newWidth = width + size * 2;
        const newHeight = height + size * 2;

        ctx.canvas.width = newWidth;
        ctx.canvas.height = newHeight;

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, newWidth, newHeight);

        ctx.drawImage(tempCanvas, size, size);
    },
};
