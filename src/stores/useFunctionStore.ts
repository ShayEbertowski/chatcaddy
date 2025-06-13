import { create } from 'zustand';
import { Prompt, PromptRow } from '../types/prompt';
import { useAuthStore } from './useAuthStore';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabaseClient';

type FunctionStore = {
    functions: Prompt[];
    loadFunctions: () => Promise<void>;
    addFunction: (title: string, content: string) => Promise<void>;
    deleteFunction: (id: string) => Promise<void>;
    clearAll: () => void;
};

export const useFunctionStore = create<FunctionStore>((set, get) => ({
    functions: [],

    loadFunctions: async () => {
        const { data, error } = await supabase
            .from('prompts')
            .select('*')
            .eq('type', 'Function');

        if (error) {
            console.error('Error loading functions:', error);
            return;
        }

        set({ functions: data });
    },

    addFunction: async (title, content) => {
        const state = useAuthStore.getState();
        const user = state.user;
        const token = state.accessToken ?? undefined;

        if (!user?.id) {
            console.error('No user ID available');
            return;
        }

        const insertData = {
            id: uuidv4(),
            title,
            content,
            folder: 'Uncategorized',
            type: 'Function',
            variables: {},
            user_id: user.id,
        };

        const { error } = await supabase.from('prompts').insert(insertData);

        if (error) {
            console.error('Error inserting function:', error);
            return;
        }

        await get().loadFunctions();
    },

    deleteFunction: async (id) => {
        const state = useAuthStore.getState();
        const token = state.accessToken ?? undefined;

        const { error } = await supabase
            .from('prompts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting function:', error);
            return;
        }

        await get().loadFunctions();
    },

    clearAll: () => set({ functions: [] }),
}));
