import { ComposerNode } from '../core/types/composer';

export function flattenTree(node: ComposerNode): ComposerNode[] {
    const result: ComposerNode[] = [node];
    for (const val of Object.values(node.variables)) {
        if (val.type === 'entity') {
            result.push(...flattenTree(val.entity));
        }
    }
    return result;
}
