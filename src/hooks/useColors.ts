import { useThemeMode } from '../theme/ThemeProvider';
import { useColorScheme } from 'react-native';
import { light, dark } from '../theme/colors';
import { Theme } from '../theme/types'; // if you've defined this

export function useColors(): Theme {
    const systemScheme = useColorScheme(); // fallback
    const { mode } = useThemeMode();       // 'light' | 'dark' | 'system'

    const resolvedScheme = mode === 'system' ? systemScheme : mode;
    const isDark = resolvedScheme === 'dark';

    return {
        ...(isDark ? dark : light),
        isDark,
    };
}
