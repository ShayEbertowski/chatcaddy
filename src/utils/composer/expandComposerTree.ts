// src/utils/composer/expandComposerTree.ts

import { ComposerNode, VariableValue } from '../../types/composer';
import { substituteVariablesInContent } from './substituteVariablesInContent';

export interface ExpandedNode {
    id: string;
    title: string;
    content: string;
    resolvedContent: string;
}

export function expandComposerTree(root: ComposerNode): ExpandedNode[] {
    const result: ExpandedNode[] = [];

    function traverse(node: ComposerNode): ExpandedNode[] {
        const expandedVariables: Record<string, string> = {};

        // First resolve variables recursively
        for (const [varName, varValue] of Object.entries(node.variables)) {
            if (varValue.type === 'string') {
                expandedVariables[varName] = varValue.value;
            } else if (varValue.type === 'entity') {
                // Recursively expand child entity first
                const childExpansion = traverse(varValue.entity);
                // Append child expansion directly into result stream
                result.push(...childExpansion);
                // For substitution: we can pull child's title or any other metadata you want
                expandedVariables[varName] = varValue.entity.title;
            }
        }

        const resolvedContent = substituteVariablesInContent(node.content, expandedVariables);

        const flattenedNode: ExpandedNode = {
            id: node.id,
            title: node.title,
            content: node.content,
            resolvedContent,
        };

        result.push(flattenedNode);

        return [];
    }

    traverse(root);
    return result;
}
