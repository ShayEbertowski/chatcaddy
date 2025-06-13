import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors } from '../../hooks/useColors';

type Props = {
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
}: Props) {
    const colors = useColors();
    const [value, setValue] = useState(currentValue);
    const styles = getStyles(colors);

    useEffect(() => {
        setValue(currentValue);
    }, [currentValue, visible]);

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Editing {`{{${variableName}}}`}</Text>

                    <TextInput
                        value={value}
                        onChangeText={setValue}
                        placeholder="Enter value"
                        placeholderTextColor={colors.secondaryText}
                        style={styles.input}
                    />

                    <TouchableOpacity onPress={() => onSave(value)} style={styles.saveButton}>
                        <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onCancel}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            padding: 24,
        },
        modal: {
            backgroundColor: colors.card,
            borderRadius: 10,
            padding: 20,
        },
        title: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 16,
            color: colors.text,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.inputBackground,
            color: colors.text,
            padding: 10,
            borderRadius: 6,
            marginBottom: 12,
            fontSize: 16,
        },
        saveButton: {
            backgroundColor: colors.primary,
            padding: 12,
            borderRadius: 6,
            marginBottom: 12,
        },
        saveText: {
            color: colors.onPrimary,
            fontWeight: '600',
            textAlign: 'center',
            fontSize: 16,
        },
        cancelText: {
            color: colors.primary,
            textAlign: 'center',
            fontSize: 16,
        },
    });