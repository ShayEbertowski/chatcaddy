// src/utils/prompt/runPromptFromTree.ts
import { runPrompt } from './runPrompt';
import { getComposerTree } from '../../lib/supabase/trees';
import { Variable } from '../../types/prompt';

type RunPromptFromTreeResult = {
    response?: string;
    error?: string;
};

// Extract first clean line from a nested prompt response
function extractSingleLine(text: string): string {
    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    return lines[0] ?? text.trim();
}

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

  return content.replace(/{{(.*?)}}/g, (_, rawKey) => {
    const key = rawKey.trim();
    const variable = variableValues[key];

    if (!variable) {
      console.warn(`⚠️ Variable "${key}" not found.`);
      return `[missing: ${key}]`;
    }

    if (variable.type === 'string') {
      return variable.value ?? '[not set]';
    }

    if (variable.type === 'prompt') {
      const nestedNode = nodes[variable.promptId];
      if (!nestedNode) {
        console.warn(`⚠️ Missing node for nested prompt "${key}"`);
        return `[missing prompt: ${key}]`;
      }

      // 👇 Recursively resolve the nested prompt's content
      const resolvedNested = resolvePromptContent(
        nestedNode.content,
        variableValues,
        nodes,
        depth + 1,
        maxDepth
      );

      return resolvedNested;
    }

    return `[unknown type: ${key}]`;
  });
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

    const finalInput = resolvePromptContent(node.content, variableValues, tree.nodes);
    console.log('Final resolved input:', finalInput);

    return await runPrompt(finalInput);
}
