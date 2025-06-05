import type { TextStyle, ViewStyle } from 'react-native';
import { light } from './colors';


export type TText = TextStyle;
export type TView = ViewStyle;

export type Theme = typeof light & {
    isDark: boolean;
};

// Dont think I need dark as long as light has them all, this is just for type safety
export type ThemeColors = typeof light;
