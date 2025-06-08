import { ComposerNode, VariableValue } from "../../core/types/composer";

export async function resolveNode(node: ComposerNode): Promise<string> {
    // First resolve all variables
    let resolvedContent = node.content;

    for (const [varName, varValue] of Object.entries(node.variables)) {
        const resolvedValue = await resolveVariable(varValue);
        const placeholder = `{{${varName}}}`;
        resolvedContent = resolvedContent.replace(placeholder, resolvedValue);
    }

    return resolvedContent;
}

async function resolveVariable(value: VariableValue): Promise<string> {
    if (typeof value === 'string') {
        return value;
    }

    // Recursive resolution for nested ComposerNode reference
    return await resolveNode(value);
}
