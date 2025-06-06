import { create } from 'zustand';
import { ComposerNode, VariableValue } from '../types/composer';
import { generateUUID } from '../utils/uuid/generateUUID';

interface ComposerStore {
    rootNode: ComposerNode | null;
    setRootNode: (node: ComposerNode) => void;
    insertEntity: (entity: Omit<ComposerNode, 'id'>) => Promise<ComposerNode>;
    updateVariable: (parentId: string, variableName: string, value: VariableValue) => void;
}

export const useComposerStore = create<ComposerStore>((set, get) => ({
    rootNode: null,

    setRootNode: (node) => set({ rootNode: node }),

    insertEntity: async (entity) => {
        const id = await generateUUID();
        const newEntity: ComposerNode = { id, ...entity };
        return newEntity;
    },

    updateVariable: (parentId, variableName, value) => {
        const updateRecursively = (node: ComposerNode): ComposerNode => {
            if (node.id === parentId) {
                return {
                    ...node,
                    variables: {
                        ...node.variables,
                        [variableName]: value,
                    },
                };
            }

            const updatedVariables: Record<string, VariableValue> = Object.fromEntries(
                Object.entries(node.variables).map(([key, val]) => {
                    if (val.type === 'entity') {
                        return [key, { type: 'entity', entity: updateRecursively(val.entity) }];
                    }
                    return [key, val];
                })
            );

            return { ...node, variables: updatedVariables };
        };

        set((state) => ({
            rootNode: updateRecursively(state.rootNode!),
        }));
    },
}));
