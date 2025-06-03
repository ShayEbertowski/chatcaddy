import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { ThemedSafeArea } from '../shared/ThemedSafeArea';

type VariableEditModalProps = {
    visible: boolean;
    variableName: string;
    currentValue: string;
    onCancel: () => void;
    onSave: (newValue: string) => void;
};

export default function VariableEditModal({
    visible,
    variableName,
    currentValue,
    onCancel,
    onSave,
}: VariableEditModalProps) {
    const colors = useColors();
    const [value, setValue] = useState(currentValue || '');

    const styles = getStyles(colors);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <ThemedSafeArea style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Editing {`{{${variableName}}}`}</Text>
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={setValue}
                        placeholder="Enter value"
                        placeholderTextColor={colors.accent}
                    />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={() => onSave(value)}
                        >
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ThemedSafeArea>
        </Modal>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        container: {
            width: '85%',
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 20,
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 16,
            color: colors.text,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            padding: 12,
            color: colors.text,
            backgroundColor: colors.background,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 20,
        },
        cancelButton: {
            marginRight: 12,
        },
        cancelText: {
            color: colors.text,
        },
        saveButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
        },
        saveText: {
            color: 'white',
            fontWeight: 'bold',
        },
    });
