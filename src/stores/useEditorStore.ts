import { create } from 'zustand';
import { EntityType, Entity } from '../types/entity';

type EditorState = {
    entityType: EntityType;
    editingEntity: Entity | null;
    editId: string | null;
    autoRun: boolean;

    setEditingEntity: (entityType: EntityType, entity: Entity, options?: { autoRun?: boolean }) => void;
    clearEditingEntity: () => void;
    resetEditor: () => void;
    setEntityType: (type: EntityType) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
    entityType: 'Prompt',
    editingEntity: null,
    editId: null,
    autoRun: false,

    setEditingEntity: (entityType, entity, options = {}) =>
        set({
            entityType,
            editingEntity: entity,
            editId: (entity as any).id,
            autoRun: options.autoRun ?? false,
        }),

    clearEditingEntity: () =>
        set({
            entityType: 'Prompt',
            editingEntity: null,
            editId: null,
            autoRun: false,
        }),

    resetEditor: () =>
        set({
            entityType: 'Prompt',
            editingEntity: null,
            editId: null,
            autoRun: false,
        }),

    setEntityType: (type) => set({ entityType: type }),
}));
