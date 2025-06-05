// src/components/modals/VariableConfigModal.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import BaseModal from './BaseModal';
import { useColors } from '../../hooks/useColors';
import type { Variable } from '../../types/prompt';

type VariableConfigModalProps = {
    visible: boolean;
    initialVariable?: Variable;
    onSave: (updated: Variable) => void;
    onCancel: () => void;
};

export default function VariableConfigModal({
    visible,
    initialVariable,
    onSave,
    onCancel
}: VariableConfigModalProps) {
    const colors = useColors();
    const styles = getStyles(colors);

    const [type, setType] = useState<'string' | 'prompt'>('string');
    const [name, setName] = useState('');
    const [value, setValue] = useState('');
    const [promptId, setPromptId] = useState('');
    const [promptTitle, setPromptTitle] = useState('');
    const [richCapable, setRichCapable] = useState(false);

    useEffect(() => {
        if (initialVariable) {
            setType(initialVariable.type);
            if (initialVariable.type === 'string') {
                setValue(initialVariable.value ?? '');
                setRichCapable(initialVariable.richCapable);
            }
            if (initialVariable.type === 'prompt') {
                setPromptId(initialVariable.promptId);
                setPromptTitle(initialVariable.promptTitle ?? '');
            }
        }
    }, [initialVariable]);

    const handleSave = () => {
        if (type === 'string') {
            onSave({
                type: 'string',
                value,
                richCapable
            });
        } else {
            onSave({
                type: 'prompt',
                promptId,
                promptTitle
            });
        }
    };

    return (
        <BaseModal visible={visible} onRequestClose={onCancel}>
            <Text style={styles.label}>Variable Type</Text>
            <View style={styles.typeRow}>
                <TouchableOpacity
                    style={[styles.typeButton, type === 'string' && styles.typeSelected]}
                    onPress={() => setType('string')}
                >
                    <Text style={styles.typeText}>String</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.typeButton, type === 'prompt' && styles.typeSelected]}
                    onPress={() => setType('prompt')}
                >
                    <Text style={styles.typeText}>Prompt Reference</Text>
                </TouchableOpacity>
            </View>

            {type === 'string' ? (
                <>
                    <Text style={styles.label}>Default Value</Text>
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={setValue}
                        placeholder="Enter default string"
                        placeholderTextColor={colors.secondaryText}
                    />
                    <View style={styles.richToggleRow}>
                        <Text style={styles.label}>Enable Rich Insertion</Text>
                        <Switch
                            value={richCapable}
                            onValueChange={setRichCapable}
                            trackColor={{
                                false: colors.switchTrackOff,
                                true: colors.switchTrackOn
                            }}
                        />
                    </View>
                </>
            ) : (
                <>
                    <Text style={styles.label}>Prompt ID</Text>
                    <TextInput
                        style={styles.input}
                        value={promptId}
                        onChangeText={setPromptId}
                        placeholder="Enter promptId"
                        placeholderTextColor={colors.secondaryText}
                    />
                    <Text style={styles.label}>Prompt Title (optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={promptTitle}
                        onChangeText={setPromptTitle}
                        placeholder="Optional title"
                        placeholderTextColor={colors.secondaryText}
                    />
                </>
            )}

            <View style={styles.buttons}>
                <TouchableOpacity onPress={onCancel} style={styles.button}>
                    <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={[styles.button, { marginLeft: 10 }]}>
                    <Text style={[styles.insertText, { color: colors.primary }]}>Save</Text>
                </TouchableOpacity>
            </View>
        </BaseModal>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        label: {
            fontWeight: '600',
            marginBottom: 8,
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
        typeRow: {
            flexDirection: 'row',
            marginBottom: 16,
        },
        typeButton: {
            flex: 1,
            padding: 10,
            borderRadius: 6,
            backgroundColor: colors.card,
            marginRight: 8,
            alignItems: 'center',
        },
        typeSelected: {
            backgroundColor: colors.primary + '33',
        },
        typeText: {
            fontWeight: '500',
            color: colors.text,
        },
        richToggleRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
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
    });
