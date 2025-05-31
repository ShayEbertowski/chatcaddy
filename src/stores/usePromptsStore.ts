import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { normalizeVariables } from '../utils/prompt/promptManager';
import { Prompt, PromptRow } from '../types/prompt';

import Constants from 'expo-constants';
import { createSupabaseClient } from '../lib/supabaseDataClient';

const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;


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
            .select('*');

        if (error) {
            console.error('Error loading prompts:', error);
            return;
        }

        set({
            prompts: data.map((p) => ({
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

        const state = useAuthStore.getState();
        const token = state.accessToken ?? undefined;
        const client = createSupabaseClient(token);
        console.log({
            apikey: SUPABASE_ANON_KEY,
            authorization: token ? `Bearer ${token}` : `Bearer ${SUPABASE_ANON_KEY}`
        });

        const { error } = await client
            .from('prompts')
            .upsert({ ...prompt, user_id: user.id });

        if (error) {
            console.error('Supabase error on upsert:', error);
        } else {
            console.log('Supabase upsert success');
        }

        await get().loadPrompts();
    },

    deletePrompt: async (id) => {
        const client = createSupabaseClient();

        const { error } = await client
            .from('prompts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting prompt:', error);
            return;
        }

        await get().loadPrompts();
    },

}));
