import { supabase } from '../../../lib/supabaseClient';
import { generateUUIDSync } from '../../../utils/uuid/generateUUIDSync';
import { ComposerNode, ComposerTreeRecord } from '../../types/composer';

const session = supabase;

export async function saveComposerTree(name: string, rootNode: ComposerNode, id?: string): Promise<string> {
    const treeId = id ?? generateUUIDSync();

    const { error } = await supabase
        .from('composer_trees')
        .upsert({
            id: treeId,
            name,
            tree_data: rootNode,
        });

    if (error) {
        throw new Error(error.message);
    }

    return treeId;
}

export async function loadComposerTree(treeId: string): Promise<ComposerTreeRecord> {
    const { data, error } = await supabase
        .from('composer_trees')
        .select('*')
        .eq('id', treeId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as ComposerTreeRecord;
}

export async function listComposerTrees(): Promise<ComposerTreeRecord[]> {
    const { data, error } = await supabase
        .from('composer_trees')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data as ComposerTreeRecord[];
}

export async function deleteComposerTree(treeId: string): Promise<void> {
    const { error } = await supabase
        .from('composer_trees')
        .delete()
        .eq('id', treeId);

    if (error) {
        throw new Error(error.message);
    }
}
