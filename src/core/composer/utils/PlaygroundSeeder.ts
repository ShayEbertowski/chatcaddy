import { Alert } from "react-native";
import { composerStore } from "../composerStore";
import { useEntityStore } from "../../../stores/useEntityStore";
import { ComposerNode } from "../../types/composer";
import { Entity } from "../../../types/entity";
import { generateUUID } from "../../../utils/uuid/generateUUID";

// Pure recursive tree generator
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

// Supabase-aware flattening & seeding
export async function flattenAndSeedEntityStore(node: ComposerNode) {
    const { addOrUpdateEntity } = useEntityStore.getState();

    const entity: Entity = {
        id: node.id,
        entityType: node.entityType,
        title: node.title,
        content: node.content,
        variables: node.variables
    };

    await addOrUpdateEntity(entity);  // <-- Persist into Supabase

    for (const val of Object.values(node.variables)) {
        if (val.type === 'entity') {
            await flattenAndSeedEntityStore(val.entity);
        }
    }
}

// Full safe seeder — now fully persistent
export async function runPlaygroundSeeder(depth: number = 5) {
    const { setRootNode } = composerStore.getState();
    const tree = await generatePlaygroundTree(depth);
    setRootNode(tree);
    await flattenAndSeedEntityStore(tree);
}
