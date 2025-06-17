import { supabase } from '../../lib/supabaseClient';
import { ComposerNode, ComposerTree } from '../../stores/useComposerStore';

export async function flattenAndSaveTree(tree: ComposerTree) {
    const flatNodes: {
        id: string;
        tree_id: string;
        parent_id: string | null;
        title: string;
        content: string;
        entity_type: string;
        path: string[];
    }[] = [];

    function walk(node: ComposerNode, parentId: string | null, path: string[]) {
        flatNodes.push({
            id: node.id,
            tree_id: tree.id,
            parent_id: parentId,
            title: node.title,
            content: node.content,
            entity_type: node.entityType,
            path,
        });

        node.childIds.forEach((childId) => {
            const child = tree.nodes[childId];
            if (child) {
                walk(child, node.id, [...path, node.id]);
            }
        });
    }

    const root = tree.nodes[tree.rootId];
    if (!root) throw new Error('Root node not found in tree');

    walk(root, null, []);

    await supabase.from('composer_nodes').delete().eq('tree_id', tree.id);
    await supabase.from('composer_nodes').upsert(flatNodes);
}
