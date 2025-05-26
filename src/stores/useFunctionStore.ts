import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

type PromptFunction = {
    id: string;
    name: string;
    value: string;
};

type FunctionState = {
    functions: PromptFunction[];
    setFunction: (name: string, value: string) => void;
    getFunction: (name: string) => PromptFunction | undefined;
    removeFunction: (name: string) => void;
    clearAll: () => void;
};

export const useFunctionStore = create<FunctionState>((set, get) => ({
    functions: [],

    setFunction: (name, value) => {
        set((state) => ({
            functions: [...state.functions, { id: uuidv4(), name, value }],
        }));
    },

    getFunction: (name) => {
        return get().functions.find((f) => f.name === name);
    },

    removeFunction: (name) => {
        set((state) => ({
            functions: state.functions.filter((f) => f.name !== name),
        }));
    },

    clearAll: () => set({ functions: [] }),
}));
