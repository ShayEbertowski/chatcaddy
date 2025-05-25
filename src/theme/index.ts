import { useColorScheme } from 'react-native';
import { light, dark } from './colors';

export function useThemeColors() {
    const scheme = useColorScheme();
    return scheme === 'dark' ? dark : light;
}
