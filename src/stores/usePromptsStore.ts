import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { Prompt, PromptRow } from '../types/prompt';
import Constants from 'expo-constants';
import { normalizePromptRow } from '../utils/prompt/normalizePrompt';
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
        const state = useAuthStore.getState();
        const token = state.accessToken ?? undefined;

        const { data, error } = await supabase
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

        console.log("🌯Preparing upsert payload:", {
            ...prompt,
            type: prompt.entityType,
            user_id: user.id,
        });


        const { error } = await supabase.from('prompts').upsert({
            ...prompt,
            type: prompt.entityType,
            user_id: user.id,
        });

        if (error) {
            console.error('Supabase error on upsert:', error);
        } else {
            console.log('Supabase upsert success');

            // Immediately update Zustand store locally
            set((state) => {
                const existingIndex = state.prompts.findIndex(p => p.id === prompt.id);
                if (existingIndex !== -1) {
                    const updatedPrompts = [...state.prompts];
                    updatedPrompts[existingIndex] = prompt;
                    return { prompts: updatedPrompts };
                } else {
                    return { prompts: [...state.prompts, prompt] };
                }
            });

            // Optionally refresh from DB later if you want hard consistency:
            await get().loadPrompts();
        }
    },


    deletePrompt: async (id) => {
        const state = useAuthStore.getState();
        const token = state.accessToken ?? undefined;

        const { error } = await supabase.from('prompts').delete().eq('id', id);

        if (error) {
            console.error('Error deleting prompt:', error);
            return;
        }

        await get().loadPrompts();
    },
}));
