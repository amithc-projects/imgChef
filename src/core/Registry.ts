import { TransformationDefinition } from './types';

class Registry {
    private transformations: Map<string, TransformationDefinition> = new Map();

    register(transformation: TransformationDefinition) {
        if (this.transformations.has(transformation.id)) {
            console.warn(`Transformation with id ${transformation.id} is already registered. Overwriting.`);
        }
        this.transformations.set(transformation.id, transformation);
    }

    get(id: string): TransformationDefinition | undefined {
        return this.transformations.get(id);
    }

    getAll(): TransformationDefinition[] {
        return Array.from(this.transformations.values());
    }
}

export const transformationRegistry = new Registry();
