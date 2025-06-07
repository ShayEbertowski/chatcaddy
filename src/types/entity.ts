export type EntityType = 'Prompt' | 'Function' | 'Snippet' | 'Template';

export interface Entity {
    id: string;
    entityType: EntityType;
    title: string;
    content: string;
    variables: Record<string, any>; // You can fully type this later if you want
}
