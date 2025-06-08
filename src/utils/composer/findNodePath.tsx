import { ComposerNode } from "../../core/types/composer";

export function findNodePath(root: ComposerNode, targetId: string): ComposerNode[] {
    if (root.id === targetId) {
        return [root];
    }

    for (const child of root.children) {
        const subPath = findNodePath(child, targetId);
        if (subPath.length) {
            return [root, ...subPath];
        }
    }

    return [];
}
