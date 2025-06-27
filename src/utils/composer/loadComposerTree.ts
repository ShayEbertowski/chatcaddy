import { supabase } from '../../lib/supabaseClient';
import { ComposerTree } from '../../stores/useComposerStore';

export async function loadComposerTree(id: string): Promise<ComposerTree> {
    const { data, error } = await supabase
        .from('composer_trees')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error || !data) throw error ?? new Error('Tree not found');

    const { id: treeId, name, root_id, nodes, updated_at } = data;
    return {
        id: treeId,
        name,
        rootId: root_id,
        nodes,
        updatedAt: updated_at,
    };
}
