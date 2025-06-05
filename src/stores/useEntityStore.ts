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
            entities: data.map((row) => normalizePromptRow(row)),
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
        const { entityType, ...rest } = entity;

        const { error } = await client.from('prompts').upsert({
            ...rest,
            type: entityType,
            user_id: user.id,
        });

        if (error) {
            console.error('Supabase error on upsert:', error);
            return;
        }

        // Instant local state update
        set((state) => {
            const filtered = state.entities.filter(e => e.id !== entity.id);
            return { entities: [...filtered, entity] };
        });
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
