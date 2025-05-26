import { useVariableStore } from '../stores/useVariableStore';
import { useSnippetStore } from '../stores/useSnippetStore';
import { useFunctionStore } from '../stores/useFunctionStore';

export type EntityType = 'Variable' | 'Snippet' | 'Function';

export function getEntityForEdit(name: string): { type: EntityType; value: string } {
    const getVariable = useVariableStore.getState().getVariable(name);
    if (getVariable !== undefined) {
        return { type: 'Variable', value: getVariable };
    }

    const getSnippet = useSnippetStore.getState().getSnippet(name);
    if (getSnippet !== undefined) {
        return { type: 'Snippet', value: getSnippet };
    }

    const getFunction = useFunctionStore.getState().getFunction(name);
    if (getFunction !== undefined) {
        return { type: 'Function', value: getFunction.value };
    }

    // Fallback
    return { type: 'Variable', value: '' };
}
