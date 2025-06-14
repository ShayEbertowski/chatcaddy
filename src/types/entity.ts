export type EntityType = 'Prompt' | 'Function' | 'Snippet' | 'Template';

export interface Entity {
    id: string;
    entityType: EntityType;
    title: string;
    content: string;
    variables: Record<string, any>;
    createdAt?: string;  // ISO timestamp (optional unless enforced by DB)
    updatedAt?: string;  // You can update this on save
}

export const uiEntityTypes = ['Prompt', 'Function', 'Snippet'] as const;
export type UIEntityType = typeof uiEntityTypes[number];

export type IndexedEntity = {
    id: string;
    entityType: 'Prompt' | 'Function' | 'Snippet';
    title: string;
    content: string;
    variables: Record<string, any>; // ✅ REQUIRED, not optional
};
