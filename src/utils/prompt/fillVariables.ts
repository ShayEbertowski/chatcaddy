// src/utils/fillVariables.ts

/**
 * Replaces all {{variable}} placeholders in a prompt string with actual values.
 * Returns either the filled prompt or an Error if any variable is missing.
 */
export function fillVariables(
    prompt: string,
    values: Record<string, string>
): string | Error {
    const usedVars = [...prompt.matchAll(/{{\s*(.*?)\s*}}/g)].map(m => m[1]);

    for (const name of usedVars) {
        const value = values[name];
        if (!value?.trim()) {
            return new Error(`Missing variable: ${name}`);
        }
        const pattern = new RegExp(`{{\\s*${name}\\s*}}`, 'g');
        prompt = prompt.replace(pattern, value);
    }

    return prompt;
}
