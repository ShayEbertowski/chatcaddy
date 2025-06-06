import { ComposerNode } from '../../types/composer';
import { generateUUID } from '../../utils/uuid/generateUUID';

export async function generatePlaygroundTree(depth: number = 5): Promise<ComposerNode> {
    const id = await generateUUID();
    const variables: Record<string, any> = {};

    if (depth > 0) {
        variables['var1'] = { type: 'string', value: `Depth ${depth}` };
        const child = await generatePlaygroundTree(depth - 1);
        variables['var2'] = { type: 'entity', entity: child };
    }

    return {
        id,
        entityType: 'Prompt',
        title: `Node ${id.substring(0, 4)}`,
        content: `Content for node ${id.substring(0, 4)}`,
        variables,
    };
}
