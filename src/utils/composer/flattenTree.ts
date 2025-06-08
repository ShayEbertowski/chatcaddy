import { ComposerNode } from "../../core/types/composer";

export function flattenTree(root: ComposerNode): ComposerNode[] {
    const result: ComposerNode[] = [];

    function traverse(node: ComposerNode) {
        result.push(node);
        node.children.forEach(traverse);
    }

    traverse(root);
    return result;
}
