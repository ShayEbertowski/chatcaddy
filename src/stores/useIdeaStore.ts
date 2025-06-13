import { create } from 'zustand';
import { IdeaRow } from '../types/idea';
import { useAuthStore } from './useAuthStore';
import { supabase } from '../lib/supabaseClient';

type IdeaStore = {
    ideas: IdeaRow[];
    loadIdeas: () => Promise<void>;
    addIdea: (content: string) => Promise<void>;
    deleteIdea: (id: string) => Promise<void>;
    updateIdea: (id: string, newContent: string) => Promise<void>;
};

export const useIdeaStore = create<IdeaStore>((set, get) => ({
    ideas: [],

    loadIdeas: async () => {
        const token = useAuthStore.getState().accessToken;

        const { data, error } = await supabase
            .from<'ideas', IdeaRow>('ideas')
            .select('*');

        if (error) {
            console.error('Error loading ideas:', error);
            return;
        }

        set({ ideas: data });
    },

    addIdea: async (content) => {
        const state = useAuthStore.getState();
        const token = state.accessToken;
        const user = state.user;

        if (!user?.id) {
            console.error('No user ID available');
            return;
        }

        const { error } = await supabase
            .from('ideas')
            .insert({
                content,
                user_id: user.id,
            });

        if (error) {
            console.error('Error adding idea:', error);
            return;
        }

        await get().loadIdeas();
    },

    updateIdea: async (id, newContent) => {
        const token = useAuthStore.getState().accessToken;

        const { error } = await supabase
            .from('ideas')
            .update({ content: newContent })
            .eq('id', id);

        if (error) {
            console.error('Error updating idea:', error);
            return;
        }

        await get().loadIdeas();
    },

    deleteIdea: async (id) => {
        const token = useAuthStore.getState().accessToken;

        const { error } = await supabase
            .from('ideas')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting idea:', error);
            return;
        }

        await get().loadIdeas();
    },
}));
