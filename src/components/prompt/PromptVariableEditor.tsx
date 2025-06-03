import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import InsertModalV2 from '../modals/InsertModalV2';
import BaseModal from '../modals/BaseModal';
import { useColors } from '../../hooks/useColors';
import { Prompt } from '../../types/prompt';
import { RichVariableRenderer } from '../shared/RichVariableRenderer';
import VariableEditModal from '../modals/VariableEditModal';
import { getSharedStyles } from '../../styles/shared';

type PromptVariableEditorProps = {
    prompt: Prompt;
    initialValues?: Record<string, string>;
    onChange: (values: Record<string, string>) => void;
    onZoomIntoPrompt?: (id: string) => void;
};

export function PromptVariableEditor({ prompt, initialValues = {}, onChange }: PromptVariableEditorProps) {
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);

    const [inputs, setInputs] = useState<Record<string, string>>(initialValues);
    const [insertTarget, setInsertTarget] = useState<string | null>(null);
    const [editingMode, setEditingMode] = useState<'String' | 'Function'>('String');
    const [tempVariable, setTempVariable] = useState<string>('');
    const [showInsertModal, setShowInsertModal] = useState(false);
    const [editingVariable, setEditingVariable] = useState<{ name: string; value: string } | null>(null);

    // Keep parent informed of changes
    useEffect(() => {
        onChange(inputs);
    }, [inputs]);

    // Initialize variable values from prompt definition
    useEffect(() => {
        const initial: Record<string, string> = {};
        Object.entries(prompt.variables ?? {}).forEach(([k, v]) => {
            if (v.type === 'string') {
                initial[k] = initialValues[k] ?? v.value ?? '';
            } else if (v.type === 'prompt') {
                initial[k] = initialValues[k] ?? `{{${v.promptTitle}}}`;
            }
        });
        setInputs((prev) => ({ ...initial, ...prev }));
    }, [prompt]);

    const handleChipPress = (name: string) => {
        setEditingVariable({ name, value: inputs[name] ?? '' });
    };

    const handleInsert = (value: string) => {
        if (!insertTarget) return;
        setInputs((prev) => ({
            ...prev,
            [insertTarget]: editingMode === 'Function' ? `{{${value}}}` : value,
        }));
        setShowInsertModal(false);
        setInsertTarget(null);
        setTempVariable('');
    };

    if (!prompt.variables) return null;

    return (
        <View>
            {Object.entries(prompt.variables).map(([name, val]) => (
                <View key={name} style={styles.inputGroup}>
                    <View style={styles.inputLabelRow}>
                        <Text style={styles.label}>{name}</Text>

                        <TouchableOpacity
                            onPress={() => {
                                setInsertTarget(name);
                                setEditingMode(val.type === 'string' ? 'String' : 'Function');
                                setTempVariable(inputs[name] ?? '');
                                setShowInsertModal(true);
                            }}
                        >
                            <MaterialIcons name="add-circle" size={28} color={colors.accent} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputBox}>
                        <RichVariableRenderer
                            value={inputs[name] || ''}
                            onVariablePress={handleChipPress}
                        />
                    </View>

                </View>
            ))}

            {/* Insert Modal (Pencil icon opens this) */}
            {showInsertModal && insertTarget && (
                <BaseModal
                    visible
                    blur
                    onRequestClose={() => {
                        setShowInsertModal(false);
                        setInsertTarget(null);
                        setTempVariable('');
                    }}
                >
                    <InsertModalV2
                        visible
                        insertTarget={insertTarget}
                        onRequestClose={() => {
                            setShowInsertModal(false);
                            setInsertTarget(null);
                            setTempVariable('');
                        }}
                        onInsert={handleInsert}
                        entityType={editingMode === 'Function' ? 'Function' : 'Variable'}
                    />
                </BaseModal>
            )}

            {/* Inline Variable Edit Modal (Chip opens this) */}
            {editingVariable && (
                <VariableEditModal
                    visible={!!editingVariable}
                    variableName={editingVariable.name}
                    currentValue={editingVariable.value}
                    onCancel={() => setEditingVariable(null)}
                    onSave={(newValue) => {
                        setInputs((prev) => ({
                            ...prev,
                            [editingVariable.name]: newValue,
                        }));
                        setEditingVariable(null);
                    }}
                />
            )}
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        inputGroup: { marginBottom: 16 },
        label: { fontSize: 14, color: colors.accent, marginBottom: 4 },
        inputLabelRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
        },
        inputBox: {
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.inputBackground,
            borderRadius: 8,
            padding: 10,
        },
        input: {
            color: colors.text,
            fontSize: 16,
            paddingVertical: 8,
            paddingHorizontal: 10,
        },

    });
