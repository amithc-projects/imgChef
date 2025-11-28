export type ParameterType = 'text' | 'number' | 'boolean' | 'select' | 'color' | 'range';

export interface ParameterDefinition {
    name: string;
    label: string;
    type: ParameterType;
    defaultValue?: any;
    options?: { label: string; value: any }[]; // For select
    min?: number;
    max?: number;
    step?: number;
}

export interface TransformationContext {
    originalImage: HTMLImageElement;
    filename: string;
    metadata?: Record<string, any>;
}

export interface TransformationDefinition {
    id: string;
    name: string;
    description: string;
    params: ParameterDefinition[];
    apply: (
        ctx: CanvasRenderingContext2D,
        params: Record<string, any>,
        context: TransformationContext
    ) => Promise<void> | void;
}

export interface RecipeStep {
    id: string;
    transformationId: string;
    params: Record<string, any>;
}

export interface Recipe {
    id: string;
    name: string;
    steps: RecipeStep[];
}
