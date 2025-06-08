import { supabase } from "../../../lib/supabaseClient";
import { ComposerNode } from "../../types/composer";


export async function saveComposerTree(
    name: string,
    rootNode: ComposerNode,
    id?: string
): Promise<string> {
    const treeId = id ?? rootNode.id;

    const { error } = await supabase.from('composer_trees').upsert({
        id: treeId,
        name,
        tree_data: rootNode,
    });

    if (error) {
        console.error('Supabase error in saveComposerTree:', error);
        throw new Error(error.message);
    }

    return treeId;
}

export async function loadComposerTree(treeId: string) {
    const { data, error } = await supabase
        .from('composer_trees')
        .select('*')
        .eq('id', treeId)
        .single();

    if (error) {
        console.error('Supabase error in loadComposerTree:', error);
        throw new Error(error.message);
    }

    return data;
}

export async function listComposerTrees() {
    const { data, error } = await supabase
        .from('composer_trees')
        .select('id, name');

    if (error) {
        console.error('Supabase error in listComposerTrees:', error);
        throw new Error(error.message);
    }

    return data;
}
