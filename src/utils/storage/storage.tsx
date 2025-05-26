import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getTapBehavior(): Promise<'preview' | 'run'> {
  const value = await AsyncStorage.getItem('@prompt_tap_behavior');
  return value === 'run' ? 'run' : 'preview';
}
