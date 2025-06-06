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

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.button, { backgroundColor: colors[colorKey] as ColorValue }, style]}
        >
            <Text style={[styles.buttonText, { color: colors.background }]}>{title}</Text>
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
    },
});
