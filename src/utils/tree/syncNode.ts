import { ComposerNode } from '../../types/composer';
import { supabase } from '../../lib/supabaseClient';

export async function flattenAndSaveTree(treeId: string, root: ComposerNode) {
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
            tree_id: treeId,
            parent_id: parentId,
            title: node.title,
            content: node.content,
            entity_type: node.entityType,
            path,
        });

        node.children.forEach((child) => {
            walk(child, node.id, [...path, node.id]);
        });
    }

    walk(root, null, []);

    // Clear old + insert fresh
    await supabase.from('composer_nodes').delete().eq('tree_id', treeId);
    await supabase.from('composer_nodes').upsert(flatNodes);
}
