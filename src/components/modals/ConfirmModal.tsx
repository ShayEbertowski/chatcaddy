import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColors } from '../../hooks/useColors';
import BaseModal from '../BaseModal';

type Props = {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
};

export default function ConfirmModal({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Discard',
    cancelText = 'Cancel',
}: Props) {
    const colors = useColors();

    return (
        <BaseModal visible={visible} onRequestClose={onCancel} blur>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.secondaryText }]}>{message}</Text>

            <View style={styles.actions}>
                <TouchableOpacity onPress={onCancel} style={styles.button}>
                    <Text style={{ color: colors.text }}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onConfirm} style={styles.button}>
                    <Text style={{ color: colors.error }}>{confirmText}</Text>
                </TouchableOpacity>
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    message: {
        fontSize: 15,
        marginBottom: 24,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 20,
    },
    button: {
        padding: 10,
    },
});
