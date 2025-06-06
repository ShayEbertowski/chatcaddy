import { create } from 'zustand';
import { ComposerNode } from '../types/composer';
import { generateUUID } from '../utils/uuid/generateUUID';

interface ComposerStore {
    rootNode: ComposerNode | null;
    setRootNode: (node: ComposerNode) => void;
    addChildToNode: (parentId: string | null, child: ComposerNode) => void;
    insertStringChild: (parentId: string) => void;
    updateStringValue: (nodeId: string, newValue: string) => void;
}

export const useComposerStore = create<ComposerStore>((set, get) => ({
    rootNode: null,

    setRootNode: (node) => set({ rootNode: node }),

    addChildToNode: (parentId, child) => {
        if (parentId === null) {
            set({ rootNode: child });
            return;
        }

        const addRecursively = (node: ComposerNode): ComposerNode => {
            if (node.id === parentId) {
                return { ...node, children: [...node.children, child] };
            }
            return { ...node, children: node.children.map(addRecursively) };
        };

        set((state) => ({
            rootNode: addRecursively(state.rootNode!),
        }));
    },

    insertStringChild: async (parentId) => {
        const id = await generateUUID();
        const newNode: ComposerNode = {
            id,
            type: 'string',
            value: '',
            children: [],
        };
        get().addChildToNode(parentId, newNode);
    },


    updateStringValue: (nodeId, newValue) => {
        const updateRecursively = (node: ComposerNode): ComposerNode => {
            if (node.id === nodeId && node.type === 'string') {
                return { ...node, value: newValue };
            }
            return { ...node, children: node.children.map(updateRecursively) };
        };

        set((state) => ({
            rootNode: updateRecursively(state.rootNode!),
        }));
    },
}));
