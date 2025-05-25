import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@prompt_library';

export type Prompt = {
    id: string;
    title: string;
    content: string;
};

export async function savePrompt(prompt: Prompt): Promise<void> {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const prompts = stored ? JSON.parse(stored) : [];

        const updated = [...prompts, prompt];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
        console.error('❌ Failed to save prompt:', err);
        throw err;
    }
}
