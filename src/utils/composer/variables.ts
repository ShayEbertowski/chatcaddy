import { VariableValue, Variable } from "../../types/prompt";

export function toEditorVariables(
    vars: Record<string, VariableValue>
): Record<string, Variable> {
    return Object.entries(vars).reduce((acc, [name, val]) => {
        if (typeof val === "string") {
            acc[name] = {
                type: "string",
                value: val,
                richCapable: true,
            };
        } else if (
            typeof val === "object" &&
            val !== null &&
            "promptId" in val
        ) {
            acc[name] = {
                type: "prompt",
                promptId: val.promptId,
                promptTitle: val.promptTitle,
            };
        }
        return acc;
    }, {} as Record<string, Variable>);
}

export function fromEditorVariables(
    vars: Record<string, Variable>
): Record<string, VariableValue> {
    return Object.entries(vars).reduce<Record<string, VariableValue>>(
        (acc, [name, val]) => {
            if (val.type === 'string') {
                acc[name] = {
                    type: 'string',
                    value: val.value,
                }; // ✅ NO `richCapable` in VariableValue
            } else if (val.type === 'prompt') {
                acc[name] = {
                    type: 'prompt',
                    promptId: val.promptId,
                    promptTitle: val.promptTitle,
                };
            }
            return acc;
        },
        {}
    );
}
