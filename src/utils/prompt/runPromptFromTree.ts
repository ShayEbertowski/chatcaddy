import { runPrompt } from './runPrompt';
import { replaceVariables } from './replaceVariables';
import { getComposerTree } from '../../lib/supabase/trees';


type RunPromptFromTreeResult = {
    response?: string;
    error?: string;
};
export async function runPromptFromTree({
    treeId,
    nodeId,
    variableValues,
}: {
    treeId: string;
    nodeId: string;
    variableValues: Record<string, string>;
}): Promise<RunPromptFromTreeResult> {
    const tree = await getComposerTree(treeId);
    if (!tree) throw new Error('Composer tree not found');
    const node = tree.nodes[nodeId];
    if (!node) throw new Error('Prompt node not found');

    const finalInput = replaceVariables(node.content, variableValues);
    return await runPrompt(finalInput, variableValues);

}
