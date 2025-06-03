import { Variable, VariableValue } from "../../types/prompt";

export function isStringValue(val: VariableValue | undefined): val is Extract<VariableValue, { type: 'string' }> {
    return val?.type === 'string';
}

export function createStringValue(value: string): VariableValue {
    return { type: 'string', value };
}

export function resolveVariableDisplayValue(variable: Variable): string {
    if (!variable) return '';

    if (variable.type === 'string') {
        return variable.value ?? '';
    }

    if (variable.type === 'prompt') {
        return variable.promptTitle ? `{{${variable.promptTitle}}}` : '';
    }

    return '';
}


