import { ComposerNode } from '../types/composer';
import { createSupabaseClient } from '../../lib/supabaseDataClient';
import Constants from 'expo-constants';

const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;
const supabase = createSupabaseClient(SUPABASE_ANON_KEY);  // You likely already have this logic wired

export async function saveComposerTree(tree: ComposerNode, name: string) {
    const { data, error } = await supabase
        .from('composer_trees')
        .insert([{ id: tree.id, name, data: tree }]);

    if (error) {
        console.error('Failed to save Composer tree:', error);
    }
}

export async function loadComposerTree(id: string): Promise<ComposerNode | null> {
    const { data, error } = await supabase
        .from('composer_trees')
        .select('data')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Failed to load Composer tree:', error);
        return null;
    }

    return data.data as ComposerNode;
}
