import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, ColorValue } from 'react-native';
import { useColors } from '../../hooks/useColors';

interface Props {
    title: string;
    onPress: () => void;
    colorKey?: keyof ReturnType<typeof useColors>;
    style?: ViewStyle;
}

export function ThemedButton({ title, onPress, colorKey = 'primary', style }: Props) {
    const colors = useColors();

    const backgroundColor = colors[colorKey] as ColorValue;

    const textColor =
        colorKey === 'primary'
            ? colors.onPrimary
            : colorKey === 'accent'
            ? colors.onAccent
            : colors.text;

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.button, { backgroundColor }, style]}
        >
            <Text style={[styles.buttonText, { color: textColor }]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginVertical: 8,
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
});
