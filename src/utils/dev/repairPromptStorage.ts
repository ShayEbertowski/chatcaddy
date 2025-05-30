import AsyncStorage from '@react-native-async-storage/async-storage';
import { Prompt } from '../../types/prompt';
import { STORAGE_KEY } from '../prompt/promptManager';


export async function repairPromptStorage() {
    console.log('REPAIR FUNCTION CALLED ✅');

    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    console.log('RAW DATA BEFORE REPAIR:', raw);

    if (!raw) {
        console.log('No data found.');
        return;
    }

    let parsed;

    try {
        parsed = JSON.parse(raw);
    } catch (err) {
        console.error('Could not parse JSON:', err);
        return;
    }

    let cleaned: Prompt[] = [];

    // Case 1: If it's a single object, wrap in array
    if (!Array.isArray(parsed)) {
        cleaned = [parsed];
    } else {
        cleaned = parsed.flat().filter(Boolean); // handle nested arrays
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));

    console.log('REPAIRED DATA:', cleaned);
}
