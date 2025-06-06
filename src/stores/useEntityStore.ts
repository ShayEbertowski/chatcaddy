import { create } from 'zustand';
import { Entity } from '../types/entity';
import { createSupabaseClient } from '../lib/supabaseDataClient';  // assuming you have this
import Constants from 'expo-constants';

const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;

interface EntityStore {
    entities: Entity[];
    loadEntities: () => Promise<void>;
    addOrUpdateEntity: (entity: Entity) => Promise<void>;
    deleteEntity: (id: string) => Promise<void>;
    clearAll: () => void;
}

export const useEntityStore = create<EntityStore>((set, get) => ({
    entities: [],

    loadEntities: async () => {
        const supabase = createSupabaseClient();
        const { data, error } = await supabase.from('entities').select('*');
        if (error) {
            console.error('Error loading entities', error);
            return;
        }
        set({ entities: data as Entity[] });
    },

    addOrUpdateEntity: async (entity) => {
        const supabase = createSupabaseClient();
        const { error } = await supabase
            .from('entities')
            .upsert([entity], { onConflict: 'id' });

        if (error) {
            console.error("Supabase error:", error);
        } else {
            console.log("Supabase upsert successful");
        }


        set((state) => {
            const existing = state.entities.find((e) => e.id === entity.id);
            if (existing) {
                return {
                    entities: state.entities.map((e) => (e.id === entity.id ? entity : e)),
                };
            }
            return { entities: [...state.entities, entity] };
        });
    },


    deleteEntity: async (id) => {
        const supabase = createSupabaseClient();
        const { error } = await supabase.from('entities').delete().eq('id', id);
        if (error) {
            console.error('Error deleting entity', error);
            return;
        }

        set((state) => ({
            entities: state.entities.filter((e) => e.id !== id),
        }));
    },

    clearAll: () => {
        set(() => ({ entities: [] }));
    }
}));
