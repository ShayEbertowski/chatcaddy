import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import BaseModal from './BaseModal';
import { Prompt } from '../../types/prompt';
import { useColors } from '../../hooks/useColors';

type Props = {
    visible: boolean;
    onClose: () => void;
    functionPrompt: Prompt;
    onSave: (variables: Record<string, string>) => void;
};

export default function FunctionConfigModal({ visible, onClose, functionPrompt, onSave }: Props) {
    const colors = useColors();
    const styles = getStyles(colors);
    const [inputs, setInputs] = useState<Record<string, string>>({});

    useEffect(() => {
        const matches = functionPrompt.content.match(/{{(.*?)}}/g) || [];
        const vars = matches.map((m) => m.replace(/[{}]/g, '').split('=')[0].trim());
        const initial = Object.fromEntries(vars.map((v) => [v, '']));
        setInputs(initial);
    }, [functionPrompt]);

    return (
        <BaseModal visible={visible} blur onRequestClose={onClose}>
            <Text style={styles.title}>Configure: {functionPrompt.title}</Text>

            <ScrollView style={{ maxHeight: 300 }}>
                {Object.entries(inputs).map(([key, value], i) => (
                    <View key={i} style={styles.inputGroup}>
                        <Text style={styles.label}>{key}</Text>
                        <TextInput
                            style={styles.input}
                            value={value}
                            onChangeText={(text) => setInputs((prev) => ({ ...prev, [key]: text }))}
                            placeholder={`Enter ${key}`}
                            placeholderTextColor={colors.secondaryText}
                        />
                    </View>
                ))}
            </ScrollView>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.save]}
                    onPress={() => {
                        onSave(inputs);
                        onClose();
                    }}
                >
                    <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
            </View>
        </BaseModal>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        title: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 20,
        },
        inputGroup: {
            marginBottom: 16,
        },
        label: {
            fontSize: 14,
            color: colors.text,
            marginBottom: 4,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.inputBackground,
            color: colors.text,
            borderRadius: 8,
            padding: 10,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
            marginTop: 20,
        },
        button: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
        },
        cancel: {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
        },
        cancelText: {
            color: colors.text,
            fontWeight: '600',
        },
        save: {
            backgroundColor: colors.primary,
        },
        saveText: {
            color: colors.background,
            fontWeight: '600',
        },
    });
