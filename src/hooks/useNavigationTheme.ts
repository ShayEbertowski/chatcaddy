import { useColors } from './useColors';

export interface NativeTheme {
    dark: boolean;
    colors: {
        primary: string;
        background: string;
        card: string;
        text: string;
        border: string;
        notification: string;
    };
    fonts: {};  // Expo Router expects this key but you can leave it empty
}

export function useNavigationTheme(): NativeTheme {
    const colors = useColors();

    return {
        dark: colors.isDark,
        colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
            notification: colors.primary,
        },
        fonts: {}, // required by NativeTheme interface, leave empty for now
    };
}
