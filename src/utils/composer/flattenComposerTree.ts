// src/utils/composer/flattenComposerTree.ts

import { ComposerNode, VariableValue } from '../../types/composer';

export interface FlattenedNode {
    id: string;
    title: string;
    content: string;
    variables: Record<string, string>;
}

export function flattenComposerTree(root: ComposerNode): FlattenedNode[] {
    const result: FlattenedNode[] = [];

    function traverse(node: ComposerNode) {
        // Flatten variables into string form
        const flattenedVariables: Record<string, string> = {};

        for (const [varName, varValue] of Object.entries(node.variables)) {
            if (varValue.type === 'string') {
                flattenedVariables[varName] = varValue.value;
            } else if (varValue.type === 'entity') {
                // Insert entity title as placeholder string for now (future: recursive resolution)
                flattenedVariables[varName] = `[Entity: ${varValue.entity.title}]`;
            }
        }

        result.push({
            id: node.id,
            title: node.title,
            content: node.content,
            variables: flattenedVariables,
        });

        // Recursively traverse nested entities
        for (const val of Object.values(node.variables)) {
            if (val.type === 'entity') {
                traverse(val.entity);
            }
        }
    }

    traverse(root);
    return result;
}
