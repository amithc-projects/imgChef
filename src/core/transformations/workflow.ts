import { TransformationDefinition } from '../types';

export const exportStep: TransformationDefinition = {
    id: 'workflow-export',
    name: 'Export / Save Point',
    description: 'Save the image at this stage',
    params: [
        { name: 'suffix', label: 'Filename Suffix', type: 'text', defaultValue: '_processed' },
        {
            name: 'format', label: 'Format', type: 'select', options: [
                { label: 'JPEG', value: 'image/jpeg' },
                { label: 'PNG', value: 'image/png' },
                { label: 'WEBP', value: 'image/webp' }
            ], defaultValue: 'image/jpeg'
        },
    ],
    apply: () => {
        // No-op for canvas, handled by processor
    },
};
