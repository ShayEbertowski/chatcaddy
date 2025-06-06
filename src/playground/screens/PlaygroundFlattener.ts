import { ComposerNode } from '../../types/composer';

export function flattenPlaygroundTree(node: ComposerNode): ComposerNode[] {
    const result: ComposerNode[] = [node];

    for (const value of Object.values(node.variables)) {
        if (value.type === 'entity') {
            result.push(...flattenPlaygroundTree(value.entity));
        }
    }

    return result;
}
