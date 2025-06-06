import { create } from 'zustand';
import { ComposerNode } from '../types/composer';

interface ComposerStore {
    rootNode: ComposerNode | null;
    setRootNode: (node: ComposerNode) => void;
    addChildToNode: (parentId: string | null, child: ComposerNode) => void;
}

export const useComposerStore = create<ComposerStore>((set, get) => ({
    rootNode: null,

    setRootNode: (node) => set({ rootNode: node }),

    addChildToNode: (parentId, child) => {
        const addRecursively = (node: ComposerNode): ComposerNode => {
            if (node.id === parentId) {
                return { ...node, children: [...node.children, child] };
            }
            return { ...node, children: node.children.map(addRecursively) };
        };

        set((state) => ({
            rootNode: parentId
                ? addRecursively(state.rootNode!)
                : child, // create root if parentId is null
        }));
    },
}));
