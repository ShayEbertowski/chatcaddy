import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import InsertModalV2 from '../modals/InsertModalV2';
import BaseModal from '../modals/BaseModal';
import { useColors } from '../../hooks/useColors';
import { Prompt } from '../../types/prompt';
import { useFunctionStore } from '../../stores/useFunctionStore';

type PromptVariableEditorProps = {
    prompt: Prompt;
    initialValues?: Record<string, string>;
    onChange: (values: Record<string, string>) => void;
    onZoomIntoPrompt?: (id: string) => void; // optional zooming callback
};

export function PromptVariableEditor({ prompt, initialValues = {}, onChange, onZoomIntoPrompt }: PromptVariableEditorProps) {
    const colors = useColors();
    const styles = getStyles(colors);

    const [inputs, setInputs] = useState<Record<string, string>>(initialValues);
    const [insertTarget, setInsertTarget] = useState<string | null>(null);
    const [showInsertModal, setShowInsertModal] = useState(false);
    const functions = useFunctionStore((s) => s.functions);


    useEffect(() => {
        onChange(inputs);
    }, [inputs]);

    useEffect(() => {
        const initial: Record<string, string> = {};
        Object.entries(prompt.variables ?? {}).forEach(([k, v]) => {
            if (v.type === 'string') {
                initial[k] = initialValues[k] ?? v.value ?? '';
            } else if (v.type === 'prompt') {
                initial[k] = initialValues[k] ?? v.promptTitle ?? '';
            }
        });
        setInputs((prev) => ({ ...initial, ...prev }));
    }, [prompt]);

    if (!prompt.variables) {
        return null;
    }

    return (
        <View>
            {Object.entries(prompt.variables).map(([name, val]) => (
                <View key={name} style={styles.inputGroup}>
                    <View style={styles.inputLabelRow}>
                        <Text style={styles.label}>{name}</Text>

                        <TouchableOpacity onPress={() => {
                            setInsertTarget(name);
                            setShowInsertModal(true);
                        }}>
                            <MaterialIcons name="add-circle" size={28} color={colors.accent} />
                        </TouchableOpacity>
                    </View>

                    {val.type === 'string' ? (
                        <TextInput
                            style={styles.input}
                            value={inputs[name]}
                            onChangeText={(text) =>
                                setInputs((prev) => ({ ...prev, [name]: text }))
                            }
                            placeholder={`Enter ${name}`}
                            placeholderTextColor={colors.placeholder}
                        />
                    ) : (
                        <TouchableOpacity
                            onPress={() => val.promptId && onZoomIntoPrompt?.(val.promptId)}
                            style={styles.functionBox}
                        >
                            <Text style={styles.functionText}>
                                {inputs[name] || '(No function selected)'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            ))}

            {showInsertModal && insertTarget && (
                <BaseModal
                    visible
                    blur
                    onRequestClose={() => {
                        setShowInsertModal(false);
                        setInsertTarget(null);
                    }}
                >
                    <InsertModalV2
                        visible
                        insertTarget={insertTarget}
                        onRequestClose={() => {
                            setShowInsertModal(false);
                            setInsertTarget(null);
                        }}
                        onInsert={(value) => {
                            setInputs((prev) => ({
                                ...prev,
                                [insertTarget]: value,
                            }));
                        }}
                        entityType="Function"
                    />

                </BaseModal>
            )}
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: colors.accent,
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
        color: colors.text,
        padding: 10,
        borderRadius: 8,
    },
    inputLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    functionBox: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
        borderRadius: 8,
        padding: 10,
    },
    functionText: {
        color: colors.text,
    },
});
