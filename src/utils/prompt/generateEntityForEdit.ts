import { useFunctionStore } from "../../stores/useFunctionStore";
import { useSnippetStore } from "../../stores/useSnippetStore";
import { useVariableStore } from "../../stores/useVariableStore";
import { EntityForEditType } from "../../types/entity";
import { isStringValue } from "../variables/variables";

export function getEntityForEdit(name: string): EntityForEditType {
    const variable = useVariableStore.getState().getVariable(name);
    if (isStringValue(variable)) {
        return { type: 'Variable', value: variable.value };
    }

    const getSnippet = useSnippetStore.getState().getSnippet(name);
    if (getSnippet !== undefined) {
        return { type: 'Snippet', value: getSnippet.content };
    }

    const functions = useFunctionStore.getState().functions;
    const foundFunction = functions.find((f) => f.title === name);
    if (foundFunction) {
        return { type: 'Function', value: foundFunction.content };
    }

    // Fallback
    return { type: 'Variable', value: '' };
}
