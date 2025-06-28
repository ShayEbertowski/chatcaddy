import { ComposerTree } from '../../stores/useComposerStore';
import { Variable } from '../../types/prompt';

export function inferVariablesFromRoot(tree: ComposerTree): Record<string, Variable> {
    const vars: Record<string, Variable> = {};
    const root = tree.nodes[tree.rootId];

    if (!root) return vars;

    const matches = [...(root.content?.matchAll(/{{(.*?)}}/g) ?? [])];

    for (const match of matches) {
        const key = match[1].trim();

        // Try to match a node by title
        const matchingNode = Object.values(tree.nodes).find(
            (node) => node.title?.trim().toLowerCase() === key.toLowerCase()
        );

        if (matchingNode) {
            vars[key] = {
                type: 'prompt',
                promptId: matchingNode.id,
                promptTitle: matchingNode.title ?? key,
            };
        } else {
            vars[key] = {
                type: 'string',
                value: '',
                richCapable: true,
            };
        }
    }

    return vars;
}


export function flattenVariables(vars: Record<string, Variable>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(vars).map(([key, val]) => {
            if (val.type === 'string') return [key, val.value];
            if (val.type === 'prompt') return [key, `{{${val.promptTitle ?? 'Prompt'}}}`];
            return [key, ''];
        })
    );
}
