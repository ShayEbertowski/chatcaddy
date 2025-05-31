import * as SecureStore from 'expo-secure-store';

const API_KEY_STORAGE_KEY = 'openai_api_key';

export async function loadApiKey(): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
    } catch (error) {
        console.error('Failed to load API key:', error);
        return null;
    }
}

export async function saveApiKey(apiKey: string): Promise<void> {
    try {
        await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey);
    } catch (error) {
        console.error('Failed to save API key:', error);
    }
}

export async function clearApiKey(): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear API key:', error);
    }
}
