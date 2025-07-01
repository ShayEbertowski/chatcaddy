// src/utils/prompt/runPromptFromTree.ts
import { runPrompt } from './runPrompt';
import { getComposerTree } from '../../lib/supabase/trees';
import { Variable } from '../../types/prompt';

type RunPromptFromTreeResult = {
    response?: string;
    error?: string;
};

function resolvePromptContent(
    content: string,
    variableValues: Record<string, Variable>,
    nodes: Record<string, { content: string }>,
    depth: number = 0,
    maxDepth: number = 5
): string {
    if (depth > maxDepth) {
        console.warn(`[resolvePromptContent] Max depth reached (${depth})`);
        return '[max depth reached]';
    }

    console.log(`\n[resolvePromptContent] Depth: ${depth}`);
    console.log('Content before resolving:', content);

    const resolved = content.replace(/{{(.*?)}}/g, (_, rawKey) => {
        const key = rawKey.trim();
        const variable = variableValues[key];

        console.log(`-> Resolving variable: "${key}"`);
        console.log('   Variable:', variable);

        if (!variable) {
            console.warn(`   ⚠️ Variable "${key}" not found.`);
            return `[missing: ${key}]`;
        }

        if (variable.type === 'string') {
            const val = variable.value || '[not set]';
            console.log(`   ✅ String value: "${val}"`);
            return val;
        }

        if (variable.type === 'prompt') {
            const nestedNode = nodes[variable.promptId];
            if (!nestedNode) {
                console.warn(`   ⚠️ Missing nested prompt for "${key}" (promptId: ${variable.promptId})`);
                return `[missing prompt: ${key}]`;
            }

            console.log(`   🔁 Recursing into nested prompt "${key}" (promptId: ${variable.promptId})`);
            return resolvePromptContent(nestedNode.content, variableValues, nodes, depth + 1, maxDepth);
        }

        console.warn(`   ❓ Unknown variable type for "${key}"`);
        return `[unknown type: ${key}]`;
    });

    console.log('Resolved content:', resolved);
    return resolved;
}

export async function runPromptFromTree({
    treeId,
    nodeId,
    variableValues,
}: {
    treeId: string;
    nodeId: string;
    variableValues: Record<string, Variable>;
}): Promise<RunPromptFromTreeResult> {
    console.log('\n=== Running prompt from tree ===');
    console.log('Tree ID:', treeId);
    console.log('Node ID:', nodeId);
    console.log('Variable values:', JSON.stringify(variableValues, null, 2));

    const tree = await getComposerTree(treeId);
    if (!tree) throw new Error('Composer tree not found');

    const node = tree.nodes[nodeId];
    if (!node) throw new Error('Prompt node not found');

    console.log('Prompt node content:', node.content);

    const finalInput = resolvePromptContent(node.content, variableValues, tree.nodes);
    console.log('Final resolved input:', finalInput);

    // Only send string values to OpenAI — omit nested prompts
    const flatStringVars: Record<string, string> = {};
    for (const [key, val] of Object.entries(variableValues)) {
        if (val.type === 'string') {
            flatStringVars[key] = val.value;
        }
    }

    return await runPrompt(finalInput, flatStringVars);
}
