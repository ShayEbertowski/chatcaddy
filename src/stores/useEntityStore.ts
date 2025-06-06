import { create } from 'zustand';
import { Entity } from '../types/entity';

type EntityStore = {
    entities: Entity[];
    loadEntities: () => void;
    addEntity: (entity: Entity) => void;  // <-- this is the missing piece
    deleteEntity: (id: string) => void;
};

export const useEntityStore = create<EntityStore>((set) => ({
    entities: [],

    loadEntities: () => {
        // You can load entities from storage here if needed
    },

    addEntity: (entity: Entity) => {
        set((state) => ({
            entities: [...state.entities, entity],
        }));
    },

    deleteEntity: (id: string) => {
        set((state) => ({
            entities: state.entities.filter((e) => e.id !== id),
        }));
    },
}));
