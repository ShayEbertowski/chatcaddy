import AsyncStorage from '@react-native-async-storage/async-storage';

export async function savePrompt(key, promptObj) {
  await AsyncStorage.setItem(key, JSON.stringify(promptObj));
}

export async function loadPrompt(key) {
  const jsonValue = await AsyncStorage.getItem(key);
  return jsonValue != null ? JSON.parse(jsonValue) : null;
}

export async function listPromptKeys() {
  return await AsyncStorage.getAllKeys();
}
