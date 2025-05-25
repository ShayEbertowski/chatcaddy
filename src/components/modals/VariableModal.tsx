import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BaseModal from '../BaseModal';
import { useColors } from '../../hooks/useColors';

export interface VariableModalProps {
    visible: boolean;
    variableName: string;
    variableValue: string;
    onChangeName: (name: string) => void;
    onChangeValue: (value: string) => void;
    onInsert: () => void;
    onClose: () => void;
}

export default function VariableModal({
    visible,
    variableName,
    variableValue,
    onChangeName,
    onChangeValue,
    onInsert,
    onClose,
}: VariableModalProps) {
    const colors = useColors();
    const styles = getStyles(colors);

    return (
        <BaseModal visible={visible} onRequestClose={onClose}>
            <View style={styles.helperRow}>
                <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color={colors.primary}
                    style={styles.icon}
                />
                <Text style={styles.helper}>
                    Insert variables using <Text style={{ fontStyle: 'italic' }}>{"{{yourVariable}}"}</Text> syntax.
                </Text>
            </View>

            <Text style={styles.label}>Variable name:</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. topic"
                placeholderTextColor={colors.secondaryText}
                value={variableName}
                onChangeText={onChangeName}
                autoFocus
            />

            <Text style={styles.label}>Variable value (optional):</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. marketing"
                placeholderTextColor={colors.secondaryText}
                value={variableValue}
                onChangeText={onChangeValue}
            />

            <View style={styles.buttons}>
                <TouchableOpacity onPress={onClose} style={styles.button}>
                    <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onInsert} style={[styles.button, { marginLeft: 10 }]}>
                    <Text style={[styles.insertText, { color: colors.primary }]}>Insert</Text>
                </TouchableOpacity>
            </View>
        </BaseModal>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        label: {
            fontWeight: '600',
            marginBottom: 6,
            fontSize: 16,
            color: colors.text,
        },
        input: {
            borderColor: colors.border,
            borderWidth: 1,
            padding: 10,
            borderRadius: 6,
            backgroundColor: colors.inputBackground,
            color: colors.text,
            marginBottom: 12,
        },
        buttons: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 16,
        },
        button: {
            paddingHorizontal: 10,
            paddingVertical: 8,
        },
        cancelText: {
            fontWeight: '500',
        },
        insertText: {
            fontWeight: '600',
        },
        helperRow: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            padding: 10,
            borderRadius: 8,
            marginBottom: 12,
        },
        helper: {
            color: colors.secondaryText,
            fontSize: 14,
            flex: 1,
            flexWrap: 'wrap',
        },
        icon: {
            marginRight: 8,
            marginTop: 1,
        },
    });
