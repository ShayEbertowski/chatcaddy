import { Entity } from '../../types/entity';

export function extractEntityText(entity: Entity | null): string {
    if (!entity) return '';
    return entity.content ?? entity.functionBody ?? '';
}
