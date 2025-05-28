import AsyncStorage from '@react-native-async-storage/async-storage';
import { NewPrompt, Prompt, VariableValue } from '../../types/prompt';
import { v4 as uuidv4 } from 'uuid';
import { generateSmartTitle } from './generateSmartTitle';
import { cleanPromptVariables } from './cleanPrompt';
import { useVariableStore } from '../../stores/useVariableStore';


const STORAGE_KEY = '@prompt_library';

// Load all prompts
export async function loadPrompts(): Promise<Prompt[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];

    return parsed.map((p: any) => ({
        ...p,
        variables: normalizeVariables(p.variables),
    }));
}

function normalizeVariables(input: any): Record<string, VariableValue> {
    if (!input || typeof input !== 'object') return {};

    const result: Record<string, VariableValue> = {};
    for (const [key, value] of Object.entries(input)) {
        if (value !== null && typeof value === 'object' && 'type' in value) {
            result[key] = value as VariableValue;
        } else {
            result[key] = { type: 'string', value: String(value) };
        }
    }
    return result;
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


// Normalize strings for comparison
function normalize(str: string) {
    return str.trim().toLowerCase();
}

// Check for duplicates
export async function isDuplicatePrompt(inputText: string, folder: string): Promise<boolean> {
    const prompts = await loadPrompts();
    return prompts.some(
        (p) => normalize(p.content) === normalize(inputText) && p.folder === folder
    );
}

// Generate title from content
export async function getSmartTitle(inputText: string): Promise<string> {
    const raw = await generateSmartTitle(inputText);
    return raw.trim().replace(/^["']+|["']+$/g, '');
}

// Prepare prompt to save (clean, sync variables, etc.)
export function preparePromptToSave({
    id,
    inputText,
    title,
    folder,
    isEdit,
}: {
    id?: string;
    inputText: string;
    title: string;
    folder: string;
    isEdit: boolean;
}): Prompt {
    const cleaned = cleanPromptVariables(inputText);
    const currentVariables = useVariableStore.getState().values;

    return {
        id: isEdit && id ? id : uuidv4(),
        title: title.trim() || 'Untitled',
        content: cleaned,
        folder,
        variables: Object.fromEntries(
            Object.entries(currentVariables).map(([key, value]) => [
                key,
                { type: 'string', value }
            ])
        ),
    };
}
