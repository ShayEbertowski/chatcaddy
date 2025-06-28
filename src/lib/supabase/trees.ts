import { ComposerTree } from '../../stores/useComposerStore';
import { supabase } from '../supabaseClient';

export async function getComposerTree(treeId: string): Promise<ComposerTree | null> {
    const { data, error } = await supabase
        .from('composer_trees')
        .select('*')
        .eq('id', treeId)
        .single();

    if (error) {
        console.error('Failed to load composer tree:', error);
        return null;
    }

    return data as ComposerTree;
}
