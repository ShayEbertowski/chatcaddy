import { v4 as uuidv4 } from 'uuid';
import { PromptPart, Variable } from '../../types/prompt';
import { cleanPromptVariables } from './cleanPrompt';
import { useVariableStore } from '../../stores/useVariableStore';
import { generateSmartTitle } from './generateSmartTitle';
import { Entity } from '../../types/entity';

/* ──────────────────────────────────────────────────────────── */
/*  Helpers: variables                                          */
/* ──────────────────────────────────────────────────────────── */

export function normalizeVariables(
    variables: Record<string, Variable>
): Record<string, Variable> {
    const result: Record<string, Variable> = {};

    Object.entries(variables).forEach(([name, variable]) => {
        if (variable.type === 'string') {
            result[name] = { ...variable, richCapable: variable.richCapable ?? true };
        } else {
            result[name] = variable;
        }
    });

    return result;
}

/* ──────────────────────────────────────────────────────────── */
/*  Prompt save utilities                                       */
/* ──────────────────────────────────────────────────────────── */

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

export async function getSmartTitle(inputText: string): Promise<string> {
    const raw = await generateSmartTitle(inputText);
    return raw.trim().replace(/^["']+|["']+$/g, '');
}

/* ──────────────────────────────────────────────────────────── */
/*  Prompt parsing                                              */
/* ──────────────────────────────────────────────────────────── */

/**
 * Break raw prompt text into chunks of `{ type: 'text' } | { type: 'variable' }`
 * Guards against undefined or empty input.
 */
export function parsePromptParts(raw: string | undefined): PromptPart[] {
    if (!raw) return [];

    const splitParts = raw.split(/({{.*?}})/g);

    return splitParts.map<PromptPart>((part) => {
        const match = part.match(/^{{\s*(.*?)\s*}}$/);
        if (match) {
            return { type: 'variable', name: match[1] };
        }
        return { type: 'text', value: part };
    });
}

/* ──────────────────────────────────────────────────────────── */
/*  Variable helpers                                            */
/* ──────────────────────────────────────────────────────────── */

export function extractInitialValues(
    variables: Record<string, Variable>
): Record<string, string> {
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
    value = '',
    richCapable = true
): Variable {
    return { type: 'string', value, richCapable };
}

export function loadVariablesIntoStore(
    variables: Record<string, Variable> | undefined
) {
    if (!variables) return;
    const { setVariable } = useVariableStore.getState();
    Object.entries(variables).forEach(([name, variable]) =>
        setVariable(name, variable)
    );
}

export function extractVariablesFromStore(): Record<string, Variable> {
    return useVariableStore.getState().values;
}

export function createDefaultVariables(
    variableNames: string[]
): Record<string, Variable> {
    const result: Record<string, Variable> = {};
    variableNames.forEach((name) => {
        result[name] = { type: 'string', value: '', richCapable: true };
    });
    return result;
}
