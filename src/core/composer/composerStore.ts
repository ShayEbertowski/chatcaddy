import { create } from 'zustand';
import { ComposerNode, VariableValue, ComposerStoreState } from '../types/composer';
import * as persistence from '../composer/services/ComposerPersistence';
import { ComposerTreeItem } from '../../../app/(drawer)/(composer)';
import { mapTreeRecordToItem } from '../../utils/composer/mapper';

export const composerStore = create<ComposerStoreState>((set, get) => ({
    activeTreeId: null,
    rootNode: null,
    availableTrees: [],

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

    listTrees: async () => {
        try {
            const trees = await persistence.listComposerTrees();
            const mapped: ComposerTreeItem[] = trees.map(mapTreeRecordToItem);
            set({ availableTrees: mapped });
            return mapped;
        } catch (error) {
            console.error('Error fetching trees:', error);
            set({ availableTrees: [] });
            return [];
        }
    },

    addChild(parentId: string, childNode: ComposerNode) {
        const { rootNode } = get();
        if (!rootNode) return;

        function insert(node: ComposerNode): ComposerNode {
            if (node.id === parentId) {
                return {
                    ...node,
                    children: [...(node.children ?? []), childNode],
                };
            }

            return {
                ...node,
                children: node.children?.map(insert) ?? [],
            };
        }

        const updatedRoot = insert(rootNode);
        set({ rootNode: updatedRoot });
    },
}));
