import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { Prompt, PromptRow } from '../types/prompt';
import Constants from 'expo-constants';
import { createSupabaseClient } from '../lib/supabaseDataClient';
import { normalizePromptRow } from '../utils/prompt/normalizePrompt';

type PromptStore = {
    prompts: Prompt[];
    loadPrompts: () => Promise<void>;
    addOrUpdatePrompt: (prompt: Prompt) => Promise<void>;
    deletePrompt: (id: string) => Promise<void>;
};

export const usePromptStore = create<PromptStore>((set, get) => ({
    prompts: [],

    loadPrompts: async () => {
        const state = useAuthStore.getState();
        const token = state.accessToken ?? undefined;
        const client = createSupabaseClient(token);

        const { data, error } = await client
            .from('prompts')
            .select('*')
            .eq('type', 'Prompt');  // ✅ filter only real prompts

        if (error) {
            console.error('Error loading prompts:', error);
            return;
        }

        set({
            prompts: data.map((p: PromptRow) => normalizePromptRow(p)),
        });
    },

    addOrUpdatePrompt: async (prompt) => {
        const state = useAuthStore.getState();
        const user = state.user;
        const token = state.accessToken ?? undefined;

        if (!user?.id) {
            console.error('No user ID available');
            return;
        }

        const client = createSupabaseClient(token);

        const { error } = await client.from('prompts').upsert({
            ...prompt,
            type: prompt.entityType,  // convert entityType back into `type` for DB
            user_id: user.id,
        });

        if (error) {
            console.error('Supabase error on upsert:', error);
        } else {
            console.log('Supabase upsert success');
        }

        await get().loadPrompts();
    },

    deletePrompt: async (id) => {
        const state = useAuthStore.getState();
        const token = state.accessToken ?? undefined;
        const client = createSupabaseClient(token);

        const { error } = await client.from('prompts').delete().eq('id', id);

        if (error) {
            console.error('Error deleting prompt:', error);
            return;
        }

        await get().loadPrompts();
    },
}));
