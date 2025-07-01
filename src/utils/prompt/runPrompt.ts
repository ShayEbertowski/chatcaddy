import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type RunPromptResult =
    | { response: string }
    | { error: string };

export async function runPrompt(
    input: string
): Promise<RunPromptResult> {
    try {
        const apiKey = await SecureStore.getItemAsync('openai_api_key');
        if (!apiKey) {
            return { error: 'No API key found. Please enter one in settings.' };
        }

        const finalPrompt = input;

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: finalPrompt }],
            }),
        });

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content || 'No response';

        return { response: reply };
    } catch (err: any) {
        console.error('❌ runPrompt failed:', err);
        return { error: err.message || 'Something went wrong' };
    }
}
