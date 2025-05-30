import { create } from 'zustand';
import { supabaseData } from '../lib/supabaseClient';
import { useAuthStore } from './useAuthStore';
import { Prompt } from '../types/prompt';
import { normalizeVariables } from '../utils/prompt/promptManager';

type PromptStore = {
    prompts: Prompt[];
    loadPrompts: () => Promise<void>;
    addOrUpdatePrompt: (prompt: Prompt) => Promise<void>;
    deletePrompt: (id: string) => Promise<void>;
};

export const usePromptStore = create<PromptStore>((set, get) => ({
    prompts: [],

    loadPrompts: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const { data, error } = await supabaseData
            .from('prompts')
            .select('*')
            .eq('user_id', user.id); // ✅ per-user filtering

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
        const user = useAuthStore.getState().user;
        if (!user) return;

        const upsertData = {
            ...prompt,
            user_id: user.id, // ✅ inject user_id automatically
        };

        const { error } = await supabaseData.from('prompts').upsert(upsertData);
        if (error) {
            console.error('Error saving prompt:', error);
            return;
        }

        await get().loadPrompts();
    },

    deletePrompt: async (id) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const { error } = await supabaseData
            .from('prompts')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // ✅ extra safety check: only delete your own

        if (error) {
            console.error('Error deleting prompt:', error);
            return;
        }

        await get().loadPrompts();
    }
}));
