import { create } from 'zustand';
import { Prompt } from '../types/prompt';
import { normalizeVariables } from '../utils/prompt/promptManager';
import { supabase } from '../lib/supabaseClient';

type PromptStore = {
    prompts: Prompt[];
    loadPrompts: () => Promise<void>;
    addOrUpdatePrompt: (prompt: Prompt) => Promise<void>;
    deletePrompt: (id: string) => Promise<void>;
};

export const usePromptStore = create<PromptStore>((set, get) => ({
    prompts: [],

    loadPrompts: async () => {
        const { data, error } = await supabase.from('prompts').select('*');
        if (error) {
            console.error('Error loading prompts:', error);
            return;
        }
        set({
            prompts: data.map((p: any) => ({
                ...p,
                variables: normalizeVariables(p.variables),
            }))
        });
    },

    addOrUpdatePrompt: async (prompt) => {
        const { error } = await supabase.from('prompts').upsert(prompt);
        if (error) {
            console.error('Error saving prompt:', error);
            return;
        }
        await get().loadPrompts();
    },

    deletePrompt: async (id) => {
        const { error } = await supabase.from('prompts').delete().eq('id', id);
        if (error) {
            console.error('Error deleting prompt:', error);
            return;
        }
        await get().loadPrompts();
    }
}));
