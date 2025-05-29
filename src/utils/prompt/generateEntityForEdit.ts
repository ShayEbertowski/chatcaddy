import { useFunctionStore } from "../../stores/useFunctionStore";
import { useSnippetStore } from "../../stores/useSnippetStore";
import { useVariableStore } from "../../stores/useVariableStore";
import { isStringValue } from "../variables/variables";


export type EntityType = 'Variable' | 'Snippet' | 'Function';

export function getEntityForEdit(name: string): { type: EntityType; value: string } {
    const variable = useVariableStore.getState().getVariable(name);
    if (isStringValue(variable)) {
        return { type: 'Variable', value: variable.value };
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
