import { TransformationDefinition } from '../../types';

export const loadState: TransformationDefinition = {
    id: 'workflow-load-state',
    name: 'Load State',
    description: 'Load a saved image state.',
    params: [
        {
            name: 'variableName',
            label: 'Variable Name',
            type: 'text',
            defaultValue: 'temp'
        },
        {
            name: 'mode',
            label: 'Mode',
            type: 'select',
            options: [
                { label: 'Replace', value: 'replace' },
                { label: 'Overlay', value: 'overlay' }
            ],
            defaultValue: 'replace'
        },
        {
            name: 'opacity',
            label: 'Opacity',
            type: 'range',
            min: 0,
            max: 100,
            defaultValue: 100
        }
    ],
    apply: async (ctx, params, context) => {
        const variableName = params.variableName || 'temp';
        const mode = params.mode || 'replace';
        const opacity = (params.opacity !== undefined ? params.opacity : 100) / 100;

        const imageData = context.variables.get(variableName);
        if (!imageData) {
            console.warn(`Variable ${variableName} not found`);
            return;
        }

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        tempCtx.putImageData(imageData, 0, 0);

        if (mode === 'replace') {
            ctx.canvas.width = imageData.width;
            ctx.canvas.height = imageData.height;
            ctx.globalAlpha = opacity;
            ctx.drawImage(tempCanvas, 0, 0);
            ctx.globalAlpha = 1.0;
        } else if (mode === 'overlay') {
            ctx.globalAlpha = opacity;
            // Overlay usually means drawing on top, maybe centered or stretched?
            // For now, let's just draw at 0,0. 
            // If dimensions differ, it might look weird, but that's expected.
            ctx.drawImage(tempCanvas, 0, 0);
            ctx.globalAlpha = 1.0;
        }
    }
};
