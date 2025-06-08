import { ComposerNode } from '../../core/types/composer';

/**
 * Builds the full path (breadcrumb) from root to the target node.
 */
export function getNodePath(root: ComposerNode, targetId: string): ComposerNode[] {
    const buildPath = (node: ComposerNode, path: ComposerNode[] = []): ComposerNode[] | null => {
        if (node.id === targetId) return [...path, node];

        for (const child of node.children ?? []) {
            const result = buildPath(child, [...path, node]);
            if (result) return result;
        }

        return null;
    };

    return buildPath(root) ?? [root];
}

/**
 * Extracts the parent node ID from a given path.
 */
export function getParentNodeId(path: ComposerNode[]): string | null {
    if (path.length > 1) {
        return path[path.length - 2].id;
    }
    return null;
}
