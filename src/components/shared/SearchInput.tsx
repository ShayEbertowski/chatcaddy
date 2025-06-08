import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useColors } from '../../hooks/useColors';

type Props = {
    value: string;
    onChange: (text: string) => void;
    placeholder?: string;
};

export default function SearchInput({ value, onChange, placeholder }: Props) {
    const colors = useColors();
    const styles = getStyles(colors);

    return (
        <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={placeholder ?? 'Type to search...'}
            placeholderTextColor={colors.secondaryText}
            style={styles.input}
        />
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        input: {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            color: colors.text,
        },
    });
