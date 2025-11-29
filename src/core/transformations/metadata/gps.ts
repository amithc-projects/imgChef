import { TransformationDefinition } from '../../types';

export const stripMetadata: TransformationDefinition = {
    id: 'meta-strip',
    name: 'Strip Metadata',
    description: 'Remove GPS and Camera metadata.',
    params: [],
    apply: (ctx, params, context) => {
        // Canvas export naturally strips metadata.
        // We explicitly clear any metadata in the context to prevent re-attachment during export
        if (context.metadata) {
            context.metadata = {};
        }
    }
};
