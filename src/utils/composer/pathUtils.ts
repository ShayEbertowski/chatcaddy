import { ComposerNode } from '../../core/types/composer';

// clean standalone recursive helper:
function buildPath(node: ComposerNode, targetId: string, path: ComposerNode[] = []): ComposerNode[] | null {
    if (node.id === targetId) return [...path, node];
    for (const child of node.children ?? []) {
        const result = buildPath(child, targetId, [...path, node]);
        if (result) return result;
    }
    return null;
}

export function getNodePath(root: ComposerNode, targetId: string): ComposerNode[] {
    return buildPath(root, targetId) ?? [root];
}

export function getParentNodeId(path: ComposerNode[]): string | null {
    if (path.length > 1) {
        return path[path.length - 2].id;
    }
    return null;
}
