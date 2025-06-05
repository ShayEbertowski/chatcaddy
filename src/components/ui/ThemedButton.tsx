import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { ThemeColors } from '../../theme/types';

interface Props {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    disabled?: boolean;
    colorKey?: keyof ThemeColors
}

export function ThemedButton({ title, onPress, style, textStyle, disabled = false, colorKey }: Props) {
    const colors = useColors();
    const buttonColor = colorKey ? colors[colorKey] : colors.accent;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={[
                {
                    backgroundColor: disabled ? colors.disabled : buttonColor,
                    padding: 12,
                    borderRadius: 10,
                    alignItems: 'center',
                    opacity: disabled ? 0.6 : 1,
                },
                style,
            ]}
        >
            <Text
                style={[
                    {
                        color: colors.buttonText,
                        fontSize: 16,
                        fontWeight: 'bold',
                    },
                    textStyle,
                ]}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
}
