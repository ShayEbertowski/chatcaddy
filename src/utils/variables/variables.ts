import { VariableValue } from "../../types/prompt";

export function isStringValue(val: VariableValue | undefined): val is Extract<VariableValue, { type: 'string' }> {
    return val?.type === 'string';
}

export function createStringValue(value: string): VariableValue {
    return { type: 'string', value };
}

export function resolveVariableDisplayValue(value: VariableValue | undefined): string {
    if (!value) return '?';

    switch (value.type) {
        case 'string':
            return value.value.trim() || '?';
        case 'prompt':
            return value.promptTitle?.trim() || '(Unnamed prompt)';
        default:
            const _exhaustive: never = value;
            return '?';
    }
}

