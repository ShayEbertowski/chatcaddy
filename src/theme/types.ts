import type { TextStyle, ViewStyle } from 'react-native';
import { light } from './colors';


export type TText = TextStyle;
export type TView = ViewStyle;

export type Theme = typeof light & {
    isDark: boolean;
};