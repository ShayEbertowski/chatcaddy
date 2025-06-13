// core/composer/composerStore.ts

import { create } from 'zustand';
import { Variable } from '../types/prompt';
import { ComposerNode } from '../types/composer';
import { supabase } from '../lib/supabaseClient';
import { fromEditorVariables } from '../types/variable';
import { ComposerStoreState } from '../types/stores';

export const useComposerStore = create<ComposerStoreState>((set, get) => ({
    activeTreeId: null,
    rootNode: null,
    availableTrees: [],


    setRootNode(newRoot) {
        set({ rootNode: newRoot });
    },

    updateVariable(variableName, variableValue) {
        const { rootNode } = get();
        if (!rootNode) return;

        const updatedVars: Record<string, Variable> = {
            ...(fromEditorVariables(rootNode.variables as any)),
            [variableName]: variableValue,
        };

        const updated: ComposerNode = {
            ...rootNode,
            variables: updatedVars,
        };

        set({ rootNode: updated });
    },

    async loadTree(treeId) {
        const { data, error } = await supabase
            .from('composer_trees')
            .select('*')
            .eq('id', treeId)
            .single();

        if (error || !data) throw new Error(error?.message || 'Tree not found');
        set({
            rootNode: data.tree_data,
            activeTreeId: data.id,
        });
    },

    async saveTree(name) {
        const { rootNode, activeTreeId } = get();
        if (!rootNode) throw new Error('No root node to save.');

        const treeId = activeTreeId ?? generateUUIDSync();

        const { error } = await supabase
            .from('composer_trees')
            .upsert({
                id: treeId,
                name,
                tree_data: rootNode,
            });

        if (error) throw new Error(error.message);

        set({ activeTreeId: treeId });
        return treeId;
    },

    clearTree() {
        set({ rootNode: null, activeTreeId: null });
    },

    async listTrees() {
        const { data, error } = await supabase.from('composer_trees').select('id, name');
        if (error) throw new Error(error.message);
        set({ availableTrees: data });
        return data;
    },

    addChild(parentId, childNode) {
        const { rootNode } = get();
        if (!rootNode) return;

        function addRecursive(node: ComposerNode): ComposerNode {
            if (node.id === parentId) {
                return {
                    ...node,
                    children: [...node.children, childNode],
                };
            }

            return {
                ...node,
                children: node.children.map(addRecursive),
            };
        }

        const updated = addRecursive(rootNode);
        set({ rootNode: updated });
    },

    createTree(tree) {
        const { id, name, rootNode } = tree;

        set({
            activeTreeId: id,
            rootNode,
            availableTrees: [...get().availableTrees, { id, name }],
        });
    },

}));

function createSupabaseClient() {
    throw new Error('Function not implemented.');
}


function generateUUIDSync(): string | null {
    throw new Error('Function not implemented.');
}
