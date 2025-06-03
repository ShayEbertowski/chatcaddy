import { v4 as uuidv4 } from 'uuid';
import { Prompt, PromptPart, Variable, VariableValue } from '../../types/prompt';
import { cleanPromptVariables } from './cleanPrompt';
import { useVariableStore } from '../../stores/useVariableStore';
import { generateSmartTitle } from './generateSmartTitle';

export function normalizeVariables(variables: Record<string, any> | null): Record<string, Variable> {
    if (!variables) return {};

    const result: Record<string, Variable> = {};

    for (const [key, value] of Object.entries(variables)) {
        if (value.type === 'string') {
            result[key] = {
                type: 'string',
                value: value.value ?? '',
                richCapable: value.richCapable ?? true, // defaults to true if missing
            };
        } else if (value.type === 'prompt') {
            result[key] = {
                type: 'prompt',
                promptId: value.promptId,
                promptTitle: value.promptTitle,
            };
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

export function parsePromptParts(raw: string): PromptPart[] {
    const splitParts = raw.split(/({{.*?}})/g);

    return splitParts.map(part => {
        const match = part.match(/^{{\s*(.*?)\s*}}$/);
        if (match) {
            const name = match[1]!; // ✅ non-null assertion
            return { type: 'variable', name };
        }
        return { type: 'text', value: part };
    });
}


export function extractInitialValues(variables: Record<string, Variable>): Record<string, string> {
    const result: Record<string, string> = {};
    Object.entries(variables).forEach(([name, variable]) => {
        if (variable.type === 'string') {
            result[name] = variable.value ?? '';
        } else if (variable.type === 'prompt') {
            result[name] = variable.promptTitle ?? '';
        }
    });
    return result;
}

export function createVariable(
    value: string = '',
    richCapable: boolean = true
): Variable {
    return {
        type: 'string',
        value,
        richCapable,
    };
}


// Utility: load variables into store for editing
export function loadVariablesIntoStore(variables: Record<string, Variable> | undefined) {
    if (!variables) return;

    const setVariable = useVariableStore.getState().setVariable;
    Object.entries(variables).forEach(([name, variable]) => {
        setVariable(name, variable);
    });
}

// Utility: pull variables from store for saving
export function extractVariablesFromStore(): Record<string, Variable> {
    return useVariableStore.getState().values;
}

// Utility: normalize variables for new prompts (if needed)
export function createDefaultVariables(variableNames: string[]): Record<string, Variable> {
    const result: Record<string, Variable> = {};
    variableNames.forEach((name) => {
        result[name] = {
            type: 'string',
            value: '',
            richCapable: true,
        };
    });
    return result;
}
