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

        for (const [varName, varValue] of Object.entries(node.variables)) {
            if (varValue.type === 'string') {
                expandedVariables[varName] = varValue.value;
            } else if (varValue.type === 'entity') {
                const childExpansion = traverse(varValue.entity);
                result.push(...childExpansion);
                expandedVariables[varName] = varValue.entity.title;  // for now use title as placeholder
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
