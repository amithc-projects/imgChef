import { TransformationDefinition } from '../../types';

export const saveState: TransformationDefinition = {
    id: 'workflow-save-state',
    name: 'Save State',
    description: 'Save the current image state to a variable for later use.',
    params: [
        {
            name: 'variableName',
            label: 'Variable Name',
            type: 'text',
            defaultValue: 'temp'
        }
    ],
    apply: (ctx, params, context) => {
        const variableName = params.variableName || 'temp';
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        context.variables.set(variableName, imageData);
    }
};
