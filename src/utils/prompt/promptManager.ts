import { v4 as uuidv4 } from 'uuid';
import { PromptPart, Variable, VariableValue } from '../../types/prompt';
import { cleanPromptVariables } from './cleanPrompt';
import { useVariableStore } from '../../stores/useVariableStore';
import { generateSmartTitle } from './generateSmartTitle';
import { Entity } from '../../types/entity';

// Normalize variables: ensure richCapable is always set for string types
export function normalizeVariables(variables: Record<string, Variable>): Record<string, Variable> {
    const result: Record<string, Variable> = {};

    Object.entries(variables).forEach(([name, variable]) => {
        if (variable.type === 'string') {
            result[name] = {
                ...variable,
                richCapable: variable.richCapable ?? true, // default to true
            };
        } else {
            result[name] = variable;
        }
    });

    return result;
}

// Prepare a new or updated prompt entity for saving
export function preparePromptToSave({
    id,
    inputText,
    title,
    folder,
    entityType,
}: {
    id?: string;
    inputText: string;
    title: string;
    folder: string;
    entityType: 'Prompt';
}): Entity {
    const cleaned = cleanPromptVariables(inputText);
    const currentVariables = useVariableStore.getState().values;

    return {
        id: id ?? uuidv4(),
        entityType,
        title: title.trim() || 'Untitled',
        content: cleaned,
        variables: currentVariables,
        updatedAt: '',
    };
}

// Generate smart title from content
export async function getSmartTitle(inputText: string): Promise<string> {
    const raw = await generateSmartTitle(inputText);
    return raw.trim().replace(/^["']+|["']+$/g, '');
}

// Parse {{variable}} chunks out of raw prompt content
export function parsePromptParts(raw: string): PromptPart[] {
    const splitParts = raw.split(/({{.*?}})/g);

    return splitParts.map(part => {
        const match = part.match(/^{{\s*(.*?)\s*}}$/);
        if (match) {
            const name = match[1]!;
            return { type: 'variable', name };
        }
        return { type: 'text', value: part };
    });
}

// Extract initial values from variable definitions (for UI hydration)
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

// Factory: create a new string variable
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

// Utility: load variables into variable store for editing
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

// Factory: create default blank variables from list of names
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
