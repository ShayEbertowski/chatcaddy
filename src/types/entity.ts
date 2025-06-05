export type EntityForEditType =
    | { type: 'Function' | 'Snippet'; value: string }
    | { type: 'Variable'; value: string };

export type EntityType = 'Prompt' | 'Function' | 'Snippet';

export type Entity = {
    id: string;
    title: string;
    folder: string;
    entityType: EntityType;
    variables: Record<string, any>;  // you can replace `any` with your Variable type
    content?: string;             
};