import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { normalizeVariables } from '../utils/prompt/promptManager';
import { Prompt, PromptRow } from '../types/prompt';
import { createSupabaseClient } from '../lib/supabaseClient';

const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';

type PromptStore = {
    prompts: Prompt[];
    loadPrompts: () => Promise<void>;
    addOrUpdatePrompt: (prompt: Prompt) => Promise<void>;
    deletePrompt: (id: string) => Promise<void>;
};

export const usePromptStore = create<PromptStore>((set, get) => ({
    prompts: [],

    loadPrompts: async () => {
        const client = createSupabaseClient();

        const { data, error } = await client
            .from<'prompts', PromptRow>('prompts')
            .select('*'); if (error) {
                console.error('Error loading prompts:', error);
                return;
            }

        set({
            prompts: data.map((p: any) => ({
                ...p,
                variables: normalizeVariables(p.variables),
            })),
        });
    },


    addOrUpdatePrompt: async (prompt) => {
        const user = useAuthStore.getState().user;
        if (!user?.id) {
            console.error('No user ID available');
            return;
        }

        const client = createSupabaseClient();

        const { data, error } = await client
            .from<'prompts', PromptRow>('prompts')
            .select('*');

        if (error) {
            console.error('Supabase error:', error);
        } else {
            console.log('Supabase upsert success:', data);
        }

        await get().loadPrompts();
    },


    deletePrompt: async (id) => {
        const client = createSupabaseClient();

        const { data, error } = await client
            .from<'prompts', PromptRow>('prompts')
            .select('*'); if (error) {
                console.error('Error deleting prompt:', error);
                return;
            }

        await get().loadPrompts();
    },

}));
