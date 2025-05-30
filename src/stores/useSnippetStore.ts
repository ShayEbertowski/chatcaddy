import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Prompt } from '../types/prompt';

type SnippetState = {
    snippets: Prompt[];
    setSnippet: (title: string, content: string) => void;
    getSnippet: (title: string) => Prompt | undefined;
    removeSnippet: (title: string) => void;
    clearAll: () => void;
};

export const useSnippetStore = create<SnippetState>((set, get) => ({
    snippets: [],

    setSnippet: (title, content) =>
        set((state) => ({
            snippets: [
                ...state.snippets,
                {
                    id: uuidv4(),
                    title,
                    content,
                    folder: 'Uncategorized',
                    type: 'Snippet',
                },
            ],
        })),

    getSnippet: (title) => get().snippets.find((s) => s.title === title),

    removeSnippet: (title) =>
        set((state) => ({
            snippets: state.snippets.filter((s) => s.title !== title),
        })),

    clearAll: () => set({ snippets: [] }),
}));
