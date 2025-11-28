import { TransformationDefinition } from '../types';

export const grayscale: TransformationDefinition = {
    id: 'filter-grayscale',
    name: 'Grayscale',
    description: 'Convert image to grayscale',
    params: [],
    apply: (ctx) => {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);
    },
};

export const sepia: TransformationDefinition = {
    id: 'filter-sepia',
    name: 'Sepia',
    description: 'Apply sepia tone',
    params: [],
    apply: (ctx) => {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            data[i] = r * 0.393 + g * 0.769 + b * 0.189;
            data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
            data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
        }
        ctx.putImageData(imageData, 0, 0);
    },
};

export const brightness: TransformationDefinition = {
    id: 'filter-brightness',
    name: 'Brightness',
    description: 'Adjust brightness',
    params: [
        {
            name: 'level',
            label: 'Level',
            type: 'range',
            min: -100,
            max: 100,
            defaultValue: 0,
        },
    ],
    apply: (ctx, params) => {
        const level = params.level || 0;
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] += level;
            data[i + 1] += level;
            data[i + 2] += level;
        }
        ctx.putImageData(imageData, 0, 0);
    },
};

export const blur: TransformationDefinition = {
    id: 'filter-blur',
    name: 'Blur',
    description: 'Apply gaussian blur',
    params: [
        { name: 'radius', label: 'Radius (px)', type: 'number', min: 0, max: 100, defaultValue: 5 },
    ],
    apply: (ctx, params) => {
        const radius = params.radius || 0;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCtx.filter = `blur(${radius}px)`;
        tempCtx.drawImage(ctx.canvas, 0, 0);

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(tempCanvas, 0, 0);
    },
};

export const noise: TransformationDefinition = {
    id: 'filter-noise',
    name: 'Noise',
    description: 'Add random noise',
    params: [
        { name: 'amount', label: 'Amount', type: 'range', min: 0, max: 100, defaultValue: 20 },
    ],
    apply: (ctx, params) => {
        const amount = params.amount || 0;
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * amount * 2.55;
            data[i] = Math.min(255, Math.max(0, data[i] + noise));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }

        ctx.putImageData(imageData, 0, 0);
    },
};
