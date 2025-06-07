import { create } from 'zustand';
import { ComposerNode, VariableValue } from '../types/composer';
import { ComposerStoreState } from '../types/composer';
import * as persistence from '../composer/services/ComposerPersistence';

export const composerStore = create<ComposerStoreState>((set, get) => ({
    activeTreeId: null,
    rootNode: null,
    availableTrees: [],

    // ✅ STABILIZED SETTER
    setRootNode(newRoot: ComposerNode) {
        set({ rootNode: newRoot });
    },

    updateVariable(variableName: string, variableValue: VariableValue) {
        const { rootNode } = get();
        if (!rootNode) return;

        const updatedNode: ComposerNode = {
            ...rootNode,
            variables: {
                ...rootNode.variables,
                [variableName]: variableValue,
            }
        };

        set({ rootNode: updatedNode });
    },

    async loadTree(treeId) {
        const record = await persistence.loadComposerTree(treeId);
        set({
            activeTreeId: record.id,
            rootNode: record.tree_data,
        });
    },

    async saveTree(name) {
        const id = await persistence.saveComposerTree(
            name,
            get().rootNode!,
            get().activeTreeId ?? undefined
        );
        set({ activeTreeId: id });
        return id;
    },

    clearTree() {
        set({ activeTreeId: null, rootNode: null });
    },

    async listTrees() {
        const trees = await persistence.listComposerTrees();
        set({ availableTrees: trees });
    },
}));