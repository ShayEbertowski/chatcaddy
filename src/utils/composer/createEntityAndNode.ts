import { Entity, PromptEntity, FunctionEntity } from '../../types/entity';
import { ComposerNode } from '../../types/composer';
import { generateUUID } from '../uuid/generateUUID';

export async function createEntityAndNode(entityType: 'Prompt' | 'Function', title: string, content: string): Promise<{ entity: Entity; node: ComposerNode }> {
    const id = await generateUUID();

    if (entityType === 'Prompt') {
        const entity: PromptEntity = {
            id,
            entityType: 'Prompt',
            title: title || 'Untitled Prompt',
            content,
        };
        const node: ComposerNode = {
            id,
            type: 'prompt',
            title: entity.title,
            children: [],
        };
        return { entity, node };
    }

    const entity: FunctionEntity = {
        id,
        entityType: 'Function',
        title: title || 'Untitled Function',
        code: content,
    };
    const node: ComposerNode = {
        id,
        type: 'function',
        title: entity.title,
        children: [],
    };

    return { entity, node };
}
