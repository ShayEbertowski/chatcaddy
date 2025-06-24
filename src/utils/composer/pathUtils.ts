import { ComposerNode } from "../../stores/useComposerStore";

/**
 * Builds the full path (breadcrumb) from root to the target node.
 */
export function getNodePath(
    root: ComposerNode,
    targetId: string,
    allNodes: Record<string, ComposerNode>
): ComposerNode[] {
    const buildPath = (node: ComposerNode, path: ComposerNode[]): ComposerNode[] | null => {
        if (node.id === targetId) return [...path, node];

        for (const childId of node.childIds) {
            const child = allNodes[childId];
            if (!child) continue;

            const result = buildPath(child, [...path, node]);
            if (result) return result;
        }

        return null;
    };

    return buildPath(root, []) ?? [root];
}
