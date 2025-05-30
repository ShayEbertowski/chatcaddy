import { v4 as uuidv4 } from 'uuid';
import { Prompt, VariableValue } from '../../types/prompt';
import { cleanPromptVariables } from './cleanPrompt';
import { useVariableStore } from '../../stores/useVariableStore';
import { generateSmartTitle } from './generateSmartTitle';

// still useful for variable normalization
export function normalizeVariables(input: any): Record<string, VariableValue> {
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

// still useful for preparing prompts before save
export function preparePromptToSave({
    id,
    inputText,
    title,
    folder,
    type,
}: {
    id?: string;
    inputText: string;
    title: string;
    folder: string;
    type: 'Prompt' | 'Function' | 'Snippet';
}): Prompt {
    const cleaned = cleanPromptVariables(inputText);
    const currentVariables = useVariableStore.getState().values;

    return {
        id: id ?? uuidv4(),
        title: title.trim() || 'Untitled',
        content: cleaned,
        folder,
        type,
        variables: currentVariables
    };
}

// Generate title from content
export async function getSmartTitle(inputText: string): Promise<string> {
    const raw = await generateSmartTitle(inputText);
    return raw.trim().replace(/^["']+|["']+$/g, '');
}