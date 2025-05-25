import { useThemeMode } from '../theme/ThemeProvider';
import { light, dark } from '../theme/colors';

export const useColors = () => {
    const { theme } = useThemeMode();
    return theme === 'dark' ? dark : light;
};
