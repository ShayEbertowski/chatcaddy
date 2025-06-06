import { ComposerNode } from "../../types/composer";
import { generateUUID } from "../uuid/generateUUID";


// Helper to randomly generate a ComposerNode tree
export async function generateSeededTree(depth: number = 2): Promise<ComposerNode> {
    const id = await generateUUID();
    const variables: Record<string, any> = {};

    if (depth > 0) {
        // Add 1 string variable
        variables['var1'] = { type: 'string', value: 'Example string' };

        // Add 1 child entity variable
        const child = await generateSeededTree(depth - 1);
        variables['var2'] = { type: 'entity', entity: child };
    }

    return {
        id,
        entityType: 'Prompt',
        title: `Node ${id.substring(0, 4)}`,
        content: `This is content for node ${id.substring(0, 4)}`,
        variables,
    };
}
