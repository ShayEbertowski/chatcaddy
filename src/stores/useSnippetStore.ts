import { create } from 'zustand';

type Snippet = {
    id: string;
    name: string;
    value: string;
};

type SnippetState = {
    snippets: Snippet[];
    setSnippet: (name: string, value: string) => void;
    getSnippet: (name: string) => string | undefined;
    removeSnippet: (name: string) => void;
    clearAll: () => void;
};

export const useSnippetStore = create<SnippetState>((set, get) => ({
    snippets: [],

    setSnippet: (name, value) =>
        set((state) => ({
            snippets: [...state.snippets, { id: name, name, value }],
        })),

    getSnippet: (name) =>
        get().snippets.find((s) => s.name === name)?.value,

    removeSnippet: (name) =>
        set((state) => ({
            snippets: state.snippets.filter((s) => s.name !== name),
        })),

    clearAll: () => set({ snippets: [] }),
}));
