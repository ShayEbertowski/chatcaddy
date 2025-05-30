import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Prompt } from '../types/prompt';

type PromptFunction = {
    id: string;
    name: string;
    value: string;
    folder?: string;
};

type FunctionState = {
    functions: Prompt[];
    setFunction: (title: string, content: string) => void;
    getFunction: (title: string) => Prompt | undefined;
    deleteFunction: (id: string) => void;
    clearAll: () => void;
};

export const useFunctionStore = create<FunctionState>((set, get) => ({
    functions: [],

    setFunction: (title, content) => {
        set((state) => ({
            functions: [
                ...state.functions,
                {
                    id: uuidv4(),
                    title,
                    content,
                    folder: 'Uncategorized',
                    type: 'Function',
                },
            ],
        }));
    },

    getFunction: (title) => {
        return get().functions.find((f) => f.title === title);
    },

    deleteFunction: (id) => {
        set((state) => ({
            functions: state.functions.filter((f) => f.id !== id),
        }));
    },

    clearAll: () => set({ functions: [] }),
}));
