import { ComposerNode } from "../../stores/useComposerStore";

export function flattenTree(root: ComposerNode, allNodes: Record<string, ComposerNode>): ComposerNode[] {
    const result: ComposerNode[] = [];

    function traverse(node: ComposerNode) {
        result.push(node);
        node.childIds.forEach((childId) => {
            const child = allNodes[childId];
            if (child) traverse(child);
        });
    }

    traverse(root);
    return result;
}
