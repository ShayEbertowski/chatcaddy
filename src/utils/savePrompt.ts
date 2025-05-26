// utils/promptStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NewPrompt } from '../types/components';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = '@prompt_library';

export type Prompt = {
    id: string;
    title: string;
    content: string;
    folder: string;
    variables?: Record<string, string>;
};

// Load all prompts
export async function loadPrompts(): Promise<Prompt[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Save or update a prompt (based on `isEdit`)
export async function saveOrUpdatePrompt(prompt: Prompt | NewPrompt, isEdit: boolean): Promise<void> {
    const stored = await loadPrompts();

    const updated = isEdit
        ? stored.map(p => (p.id === (prompt as Prompt).id ? prompt : p))
        : [...stored, { ...prompt, id: uuidv4() }];

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// Delete a prompt by id
export async function deletePrompt(id: string): Promise<void> {
    const stored = await loadPrompts();
    const updated = stored.filter(p => p.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// Optional helper: search prompts
export async function searchPrompts(query: string): Promise<Prompt[]> {
    const all = await loadPrompts();
    return all.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.content.toLowerCase().includes(query.toLowerCase())
    );
}

// Optional helper: sort alphabetically
export async function sortPromptsByTitle(): Promise<Prompt[]> {
    const all = await loadPrompts();
    return all.sort((a, b) => a.title.localeCompare(b.title));
}

// Optional helper: filter by folder
export function filterPromptsByFolder(prompts: Prompt[], folderId: string): Prompt[] {
    if (folderId === 'All') return prompts;
    return prompts.filter(p => p.folder === folderId);
}
