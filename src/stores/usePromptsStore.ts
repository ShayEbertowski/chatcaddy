import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Prompt } from '../types/prompt';
import { normalizeVariables } from '../utils/prompt/promptManager';

const STORAGE_KEY = '@prompt_library';

type PromptStore = {
    prompts: Prompt[];
    loadPrompts: () => Promise<void>;
    addOrUpdatePrompt: (prompt: Prompt, isEdit: boolean) => Promise<void>;
    deletePrompt: (id: string) => Promise<void>;
};

export const usePromptStore = create<PromptStore>((set, get) => ({
    prompts: [],

    loadPrompts: async () => {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed: Prompt[] = raw ? JSON.parse(raw) : [];

        set({
            prompts: parsed.map(p => ({
                ...p,
                variables: normalizeVariables(p.variables),
            }))
        });
    },

    addOrUpdatePrompt: async (prompt, isEdit) => {
        console.log('🤡');

        const current = get().prompts;

        const updated = isEdit
            ? current.map(p => (p.id === prompt.id ? prompt : p))
            : [...current, prompt];

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        console.log('🥶');
        set({ prompts: updated });
    },

    deletePrompt: async (id) => {
        const updated = get().prompts.filter(p => p.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        set({ prompts: updated });
    }
}));
