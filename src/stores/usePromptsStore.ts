import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Prompt } from '../types/prompt';

type PromptsState = {
    prompts: Prompt[];

    addPrompt: (prompt: Omit<Prompt, 'id'>) => void;
    updatePrompt: (id: string, data: Partial<Prompt>) => void;
    deletePrompt: (id: string) => void;
    deleteAll: () => void;
    seedSampleData: () => void;
    isDuplicate: (content: string, folder: string) => boolean; // 👈 added
};

export const usePromptsStore = create<PromptsState>()(
    persist(
        (set, get) => ({
            prompts: [],

            addPrompt: (promptData) => {
                const newPrompt: Prompt = {
                    ...promptData,
                    id: uuidv4(),
                };
                set((state) => ({
                    prompts: [...state.prompts, newPrompt],
                }));
            },

            updatePrompt: (id, data) => {
                set((state) => ({
                    prompts: state.prompts.map((p) =>
                        p.id === id ? { ...p, ...data } : p
                    ),
                }));
            },

            deletePrompt: (id) => {
                set((state) => ({
                    prompts: state.prompts.filter((p) => p.id !== id),
                }));
            },

            deleteAll: () => {
                set({ prompts: [] });
            },


            seedSampleData: () => {
                set({
                    prompts: [
                        {
                            id: uuidv4(),
                            title: 'Welcome Prompt',
                            content: 'Hello {{name}}, welcome to ChatCaddy!',
                            folder: 'Welcome',
                            type: 'Prompt',
                            variables: {
                                name: { type: 'string', value: 'World' },
                            },
                        },
                        {
                            id: uuidv4(),
                            title: 'Daily Reflection',
                            content: 'What did you learn today?',
                            folder: 'Journals',
                            type: 'Prompt',
                            variables: {}, // You can omit this entirely if there are no variables
                        },
                    ],
                });
            },



            isDuplicate: (content, folder) =>
                get().prompts.some(
                    (p) => p.content.trim() === content.trim() && p.folder === folder
                ),
        }),
        {
            name: 'prompts-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
