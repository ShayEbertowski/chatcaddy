import { create } from 'zustand';
import { Entity } from '../types/entity';
import { supabase } from '../lib/supabaseClient';


interface EntityStore {
    entities: Entity[];
    loadEntities: () => Promise<void>;
    addOrUpdateEntity: (entity: Entity) => Promise<void>;
    deleteEntity: (id: string) => Promise<void>;
    clearAll: () => void;
    upsertEntity: (entity: Entity) => void;
}

export const useEntityStore = create<EntityStore>((set, get) => ({
    entities: [],

    loadEntities: async () => {
        const { data, error } = await supabase.from('entities').select('*');
        if (error) {
            console.error('Error loading entities', error);
            return;
        }
        set({ entities: data as Entity[] });
    },

    addOrUpdateEntity: async (entity) => {
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
        const { error } = await supabase.from('entities').delete().eq('id', id);
        if (error) {
            console.error('Error deleting entity', error);
            return;
        }

        set((state) => ({
            entities: state.entities.filter((e) => e.id !== id),
        }));
    },

    upsertEntity: (entity: Entity) => {
        set((state) => {
            const filtered = state.entities.filter(e => e.id !== entity.id);
            return { entities: [...filtered, entity] };
        });
    },


    clearAll: () => {
        set(() => ({ entities: [] }));
    }
}));
