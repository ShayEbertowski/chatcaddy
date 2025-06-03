import { Prompt } from '../../types/prompt';
import { PromptFunction } from '../../types/functions';

// Expand as you add more entity types
type Entity = Prompt | PromptFunction | null;

export function extractEntityText(entity: Entity): string {
    if (!entity) return '';
    if ('content' in entity) return entity.content ?? '';
    if ('functionBody' in entity) return entity.functionBody ?? '';
    return '';
}
