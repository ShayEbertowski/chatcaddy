export function cleanPromptVariables(prompt: string): string {
    return prompt.replace(/{{\s*([^}=]+)\s*=\s*[^}]*}}/g, (_, key) => `{{${key.trim()}}}`);
}