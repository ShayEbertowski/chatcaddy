import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { Entity } from '../types/entity';
import { createSupabaseClient } from '../lib/supabaseDataClient';
import { normalizePromptRow } from '../utils/prompt/normalizePrompt';

type EntityStore = {
    entities: Entity[];
    loadEntities: () => Promise<void>;
    addOrUpdateEntity: (entity: Entity) => Promise<void>;
    deleteEntity: (id: string) => Promise<void>;
};

export const useEntityStore = create<EntityStore>((set, get) => ({
    entities: [],

    loadEntities: async () => {
        const state = useAuthStore.getState();
        const token = state.accessToken ?? undefined;
        const client = createSupabaseClient(token);

        const { data, error } = await client.from('prompts').select('*');
        if (error) {
            console.error('Error loading entities:', error);
            return;
        }

        set({
            entities: data.map((p) => normalizePromptRow(p)),
        });
    },

    addOrUpdateEntity: async (entity) => {
        const state = useAuthStore.getState();
        const user = state.user;
        const token = state.accessToken ?? undefined;
        if (!user?.id) {
            console.error('No user ID available');
            return;
        }

        const client = createSupabaseClient(token);

        // Destructure to remove entityType before sending to Supabase
        const { entityType, ...rest } = entity;

        const { error } = await client.from('prompts').upsert({
            ...rest,
            type: entityType,  // map entityType to DB column
            user_id: user.id,
        });

        // Directly update Zustand state immediately:
        set((state) => ({
            entities: [...state.entities.filter(e => e.id !== entity.id), entity]
        }));

        if (error) {
            console.error('Supabase error on upsert:', error);
        } else {
            await get().loadEntities();
        }
    },

    deleteEntity: async (id) => {
        const state = useAuthStore.getState();
        const token = state.accessToken ?? undefined;
        const client = createSupabaseClient(token);

        const { error } = await client.from('prompts').delete().eq('id', id);
        if (error) {
            console.error('Error deleting entity:', error);
            return;
        }

        await get().loadEntities();
    },
}));
