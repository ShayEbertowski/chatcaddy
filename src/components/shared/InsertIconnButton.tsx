import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

type Props = {
    onPress: () => void;
};

export default function InsertIconButton({ onPress }: Props) {
    const colors = useColors();
    const styles = getStyles(colors);

    return (
        <TouchableOpacity onPress={onPress} style={styles.button}>
            <Ionicons name="add" size={20} color={colors.accent} />
        </TouchableOpacity>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        button: {
            backgroundColor: colors.surface,
            borderColor: colors.borderThin,
            borderWidth: 1,
            padding: 8,
            borderRadius: 6,
        },
    });
