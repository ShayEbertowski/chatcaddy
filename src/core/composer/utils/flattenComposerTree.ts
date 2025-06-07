import { ComposerNode } from "../../types/composer";

export function flattenComposerTree(root: ComposerNode | null): { node: ComposerNode; depth: number }[] {
    const result: { node: ComposerNode; depth: number }[] = [];
    if (!root) return result;

    function traverse(node: ComposerNode, depth: number) {
        result.push({ node, depth });

        for (const key in node.variables) {
            const val = node.variables[key];
            if (val.type === 'entity') {
                traverse(val.entity, depth + 1);
            }
        }
    }

    traverse(root, 0);
    return result;
}
