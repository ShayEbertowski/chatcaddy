import { create } from 'zustand';
import { PostgrestClient } from '@supabase/postgrest-js';
import { useAuthStore } from './useAuthStore';
import { normalizeVariables } from '../utils/prompt/promptManager';
import { Prompt } from '../types/prompt';

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
        const token = useAuthStore.getState().accessToken;
        if (!token) return;

        const client = new PostgrestClient(`${SUPABASE_URL}/rest/v1`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const { data, error } = await client.from('prompts').select('*');
        if (error) {
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
        const token = useAuthStore.getState().accessToken;
        if (!token) return;

        const client = new PostgrestClient(`${SUPABASE_URL}/rest/v1`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const { error } = await client.from('prompts').upsert(prompt);
        if (error) {
            console.error('Error saving prompt:', error);
            return;
        }

        await get().loadPrompts();
    },

    deletePrompt: async (id) => {
        const token = useAuthStore.getState().accessToken;
        if (!token) return;

        const client = new PostgrestClient(`${SUPABASE_URL}/rest/v1`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const { error } = await client.from('prompts').delete().eq('id', id);
        if (error) {
            console.error('Error deleting prompt:', error);
            return;
        }

        await get().loadPrompts();
    },
}));
