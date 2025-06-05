import { create } from 'zustand';
import { ComposerNode } from '../types/composer';
import { generateUUIDSync } from '../utils/uuid/generateUUIDSync';

interface ComposerStore {
    root: ComposerNode;
    setRoot: (root: ComposerNode) => void;
    addChild: (parentId: string, child: ComposerNode) => void;
}

const initialRoot: ComposerNode = {
    id: generateUUIDSync(),
    type: 'prompt',
    title: 'Main Prompt',
    children: [],
};

export const useComposerStore = create<ComposerStore>((set, get) => ({
    root: initialRoot,
    setRoot: (root) => set({ root }),
    addChild: (parentId, child) => {
        const addToTree = (node: ComposerNode): ComposerNode => {
            if (node.id === parentId) {
                return { ...node, children: [...(node.children ?? []), child] };
            }
            if (!node.children) return node;
            return { ...node, children: node.children.map(addToTree) };
        };
        set((state) => ({ root: addToTree(state.root) }));
    },
}));
