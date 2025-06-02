import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

type Props = {
    onEdit: () => void;
    onDelete: () => void;
    size?: number;
};

export default function EditOrDeleteActions({ onEdit, onDelete, size = 22 }: Props) {
    const colors = useColors();
    const styles = getStyles(colors);

    return (
        <View style={styles.actionsRow}>
            <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
                <MaterialIcons name="edit" size={size} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
                <MaterialIcons name="delete" size={size} color={colors.softError ?? 'red'} />
            </TouchableOpacity>
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        actionsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        iconButton: {
            paddingHorizontal: 6,
            paddingVertical: 4,
            borderRadius: 6,
            backgroundColor: colors.inputBackground,
        },
    });
