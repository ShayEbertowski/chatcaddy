import { supabase } from '../../lib/supabaseClient';
import { v4 as uuid } from 'uuid';
import { ComposerNode, ComposerTree } from '../../stores/useComposerStore';

export async function forkTreeFrom(sourceTreeId: string): Promise<{ treeId: string; rootId: string }> {
    const { data, error } = await supabase
        .from('composer_trees')
        .select('*')
        .eq('id', sourceTreeId)
        .maybeSingle();

    if (error || !data) {
        throw new Error('❌ Failed to load source tree');
    }

    const now = new Date().toISOString();
    const oldNodes = data.nodes as Record<string, ComposerNode>;
    const idMap = new Map<string, string>();
    const newNodes: Record<string, ComposerNode> = {};

    // Generate new IDs for all nodes
    for (const oldId in oldNodes) {
        idMap.set(oldId, uuid());
    }

    for (const oldId in oldNodes) {
        const oldNode = oldNodes[oldId];
        const newId = idMap.get(oldId)!;

        newNodes[newId] = {
            ...oldNode,
            id: newId,
            childIds: oldNode.childIds.map((cid) => idMap.get(cid)!),
            updatedAt: now,
        };
    }

    const newTreeId = uuid();
    const newRootId = idMap.get(data.root_id)!;

    await supabase.from('composer_trees').insert({
        id: newTreeId,
        name: data.name,
        root_id: newRootId,
        nodes: newNodes,
        updated_at: now,
    });

    return { treeId: newTreeId, rootId: newRootId };
}
