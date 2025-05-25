// src/utils/generateSmartTitle.ts

import * as SecureStore from 'expo-secure-store';

export async function generateSmartTitle(prompt: string): Promise<string> {
    try {
        const apiKey = await SecureStore.getItemAsync('openai_api_key');
        if (!apiKey) return 'Untitled';

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that generates short, catchy titles for user prompts.',
                    },
                    {
                        role: 'user',
                        content: `Suggest a short, descriptive title for this prompt:\n\n"${prompt}"`,
                    },
                ],
                max_tokens: 30,
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        const title = data.choices?.[0]?.message?.content?.trim() || 'Untitled';
        return title;
    } catch (error) {
        console.error('Title generation failed:', error);
        return 'Untitled';
    }
}
