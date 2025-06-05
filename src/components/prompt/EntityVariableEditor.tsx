import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import InsertModalV2 from '../modals/InsertModalV2';
import BaseModal from '../modals/BaseModal';
import { useColors } from '../../hooks/useColors';
import type { PromptEntity } from '../../types/entity';
import type { Variable, StringVariable } from '../../types/prompt';
import { RichVariableRenderer } from '../shared/RichVariableRenderer';
import VariableEditModal from '../modals/VariableEditModal';

type EntityVariableEditorProps = {
    prompt: PromptEntity;
    initialValues?: Record<string, string>;
    onChange: (values: Record<string, string>) => void;
};

export function EntityVariableEditor({
    prompt,
    initialValues = {},
    onChange,
}: EntityVariableEditorProps) {
    const colors = useColors();
    const styles = getStyles(colors);

    const [inputs, setInputs] = useState<Record<string, string>>(initialValues);
    const [insertTarget, setInsertTarget] = useState<string | null>(null);
    const [editingMode, setEditingMode] = useState<'String' | 'Function'>('String');
    const [tempVariable, setTempVariable] = useState<string>('');
    const [showInsertModal, setShowInsertModal] = useState(false);
    const [editingVariable, setEditingVariable] = useState<{ name: string; value: string } | null>(null);

    useEffect(() => {
        onChange(inputs);
    }, [inputs, onChange]);

    useEffect(() => {
        const initial: Record<string, string> = {};

        Object.entries(prompt.variables ?? {}).forEach(([name, variable]) => {
            if (variable.type === 'string') {
                initial[name] = initialValues[name] ?? variable.value ?? '';
            } else if (variable.type === 'prompt') {
                initial[name] = initialValues[name] ?? variable.promptTitle ?? '';
            }
        });

        setInputs((prev) => ({ ...initial, ...prev }));
    }, [prompt, initialValues]);

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
            {Object.entries(prompt.variables).map(([name, variable]) => {
                if (variable.type === 'string') {
                    const { richCapable = true } = variable as StringVariable;

                    return (
                        <View key={name} style={styles.inputGroup}>
                            <View style={styles.inputLabelRow}>
                                <Text style={styles.label}>{name}</Text>

                                {richCapable && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setInsertTarget(name);
                                            setEditingMode('Function');
                                            setTempVariable(inputs[name] ?? '');
                                            setShowInsertModal(true);
                                        }}
                                    >
                                        <MaterialIcons name="add-circle-outline" size={28} color={colors.accent} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {richCapable ? (
                                <View style={styles.inputBox}>
                                    <RichVariableRenderer
                                        value={inputs[name] || ''}
                                        onVariablePress={() => handleChipPress(name)}
                                    />
                                </View>
                            ) : (
                                <TextInput
                                    value={inputs[name] || ''}
                                    onChangeText={(text) =>
                                        setInputs((prev) => ({ ...prev, [name]: text }))
                                    }
                                    placeholder="Enter value"
                                    placeholderTextColor={colors.secondaryText}
                                    style={styles.inputBox}
                                />
                            )}
                        </View>
                    );
                }

                // prompt-type variable (for nested prompt refs)
                return (
                    <View key={name} style={styles.inputGroup}>
                        <Text style={styles.label}>{name}</Text>
                        <TextInput
                            value={inputs[name] || ''}
                            onChangeText={(text) =>
                                setInputs((prev) => ({ ...prev, [name]: text }))
                            }
                            placeholder="Enter value"
                            placeholderTextColor={colors.secondaryText}
                            style={styles.inputBox}
                        />
                    </View>
                );
            })}

            {/* Insert modal */}
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
                        entityType="Function"
                    />
                </BaseModal>
            )}

            {/* Inline edit modal for chips */}
            {editingVariable && (
                <VariableEditModal
                    visible
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
            fontSize: 16,
            color: colors.text,
        },
    });
