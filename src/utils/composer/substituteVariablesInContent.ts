export function substituteVariablesInContent(
    content: string,
    variables: Record<string, string>
): string {
    return content.replace(/{{(.*?)}}/g, (_, varName) => {
        const trimmedName = varName.trim();
        return variables[trimmedName] ?? `[${trimmedName} UNRESOLVED]`;
    });
}
