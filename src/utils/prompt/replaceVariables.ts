export function replaceVariables(
    input: string,
    values: Record<string, string>
): string {
    return input.replace(/{{(.*?)}}/g, (_, key) => values[key.trim()] || '');
}