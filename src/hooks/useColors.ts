// src/theme/useColors.ts
import { useColorScheme } from 'react-native';
import { light, dark } from '../theme/colors';

export function useColors() {
    const scheme = useColorScheme();
    return scheme === 'dark' ? dark : light;
}
