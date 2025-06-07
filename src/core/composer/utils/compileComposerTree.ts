import { ComposerNode, VariableValue } from "../../types/composer";

interface CompileContext {
    visitedIds: Set<string>;
}

export function compileComposerTree(node: ComposerNode): string {
    const context: CompileContext = { visitedIds: new Set() };
    return compileNode(node, context);
}

function compileNode(node: ComposerNode, context: CompileContext): string {
    if (context.visitedIds.has(node.id)) {
        return "[Circular Reference]";
    }

    context.visitedIds.add(node.id);

    let output = node.content;

    for (const [varName, varValue] of Object.entries(node.variables)) {
        const resolved = resolveVariable(varValue, context);
        const placeholder = `{{${varName}}}`;
        output = output.replaceAll(placeholder, resolved);
    }

    return output;
}

function resolveVariable(variable: VariableValue, context: CompileContext): string {
    if (variable.type === 'string') {
        return variable.value;
    }

    // entity type: recursively compile child node
    return compileNode(variable.entity, context);
}
