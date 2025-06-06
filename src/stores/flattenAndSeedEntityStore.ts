import { ComposerNode } from "../core/types/composer";
import { Entity } from "../types/entity";
import { useEntityStore } from "./useEntityStore";

export async function flattenAndSeedEntityStore(node: ComposerNode) {
    const { addOrUpdateEntity } = useEntityStore.getState();

    const entity: Entity = {
        id: node.id,
        entityType: node.entityType,
        title: node.title,
        content: node.content,
        variables: node.variables
    };

    await addOrUpdateEntity(entity);  // <-- This part works fine IF it's actually reached

    for (const val of Object.values(node.variables)) {
        if (val.type === 'entity') {
            await flattenAndSeedEntityStore(val.entity);  // <-- await recursion
        }
    }
}
