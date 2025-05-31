import { useThemeMode } from '../theme/ThemeProvider';
import { useColorScheme } from 'react-native';
import { light, dark } from '../theme/colors';
import { Theme } from '../theme/types';

export function useColors(): Theme & { isDark: boolean } {
    const systemScheme = useColorScheme(); // 'light' | 'dark' from device
    const { mode } = useThemeMode();       // 'light' | 'dark' | 'system'

    const resolvedScheme = mode === 'system' ? systemScheme : mode;
    const isDark = resolvedScheme === 'dark';

    const colorSet = isDark ? dark : light;

    return {
        ...colorSet,
        isDark,  // extra boolean if you want quick access
    };
}
