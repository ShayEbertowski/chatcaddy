import { Variable } from '../../types/prompt';

export function flattenToStrings(vars: Record<string, Variable>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(vars).map(([k, v]) => {
            if (v.type === 'string') return [k, v.value];
            if (v.type === 'prompt') return [k, `{{${v.promptId}}}`];
            return [k, ''];
        })
    );
}
