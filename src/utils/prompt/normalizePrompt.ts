import { Entity } from '../../types/entity';

export function normalizePromptRow(row: any): Entity {
    return {
        id: row.id,
        title: row.title ?? '',
        folder: row.folder ?? 'Uncategorized',
        entityType: row.entityType ?? row.type ?? 'Prompt',
        variables: row.variables || {},
        content: row.content ?? ''
    };
}
