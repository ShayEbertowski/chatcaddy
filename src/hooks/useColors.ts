import { useThemeStore } from '../stores/useThemeStore';
import { light, dark } from '../theme/colors';
import { Theme } from '../theme/types';

export function useColors(): Theme & { isDark: boolean } {
    const { mode } = useThemeStore();
    const isDark = mode === 'dark';

    const colorSet = isDark ? dark : light;

    return {
        ...colorSet,
        isDark,
    };
}
