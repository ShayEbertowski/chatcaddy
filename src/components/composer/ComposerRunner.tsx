import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
} from 'react-native';

import { useComposerStore } from '../../stores/useComposerStore';
import { useVariableStore } from '../../stores/useVariableStore';
import { useColors } from '../../hooks/useColors';
import { inferVariablesFromRoot } from '../../utils/composer/inferVariables';
import { getSharedStyles } from '../../styles/shared';
import { StringVariable, Variable } from '../../types/prompt';

interface ComposerRunnerProps {
    treeId: string;
    nodeId: string;
    readOnly?: boolean;
    allowVariableInput?: boolean;
    onVariablesChange?: (flatVars: Record<string, string>) => void;
    onChipPress?: (name: string) => void;
}

function isStringVariable(v: Variable | undefined): v is StringVariable {
    return !!v && v.type === 'string' && 'value' in v && 'richCapable' in v;
}

export const ComposerRunner: React.FC<ComposerRunnerProps> = ({
    treeId,
    nodeId,
    onVariablesChange,
    onChipPress,
}) => {
    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);
    const composerTree = useComposerStore((s) => s.composerTree);
    const [contentParts, setContentParts] = useState<string[] | null>(null);
    const [editingVar, setEditingVar] = useState<string | null>(null);
    const [tempValue, setTempValue] = useState('');

    const node = useMemo(() => composerTree?.nodes?.[nodeId], [composerTree, nodeId]);

    useEffect(() => {
        useComposerStore.getState().loadTree(treeId);
    }, [treeId]);

    useEffect(() => {
        if (!composerTree || !node) return;

        const inferred = inferVariablesFromRoot(composerTree, nodeId);

        const filled: Record<string, Variable> = {};
        for (const key of Object.keys(inferred)) {
            const val = inferred[key];
            if (val.type === 'string') {
                filled[key] = { ...val, value: '' };
            } else if (val.type === 'prompt') {
                filled[key] = val;
            } else {
                filled[key] = { type: 'string', value: '', richCapable: false };
            }
        }

        const placeholderKeys = (node.content.match(/{{(.*?)}}/g) || [])
            .map(k => k.replace(/[{}]/g, '').trim());
        for (const key of placeholderKeys) {
            if (!filled[key]) {
                filled[key] = { type: 'string', value: '', richCapable: false };
            }
        }

        const existingVars = useVariableStore.getState().values;
        const merged: Record<string, Variable> = { ...existingVars };
        for (const key of Object.keys(filled)) {
            if (!merged[key]) {
                merged[key] = filled[key];
            }
        }

        useVariableStore.getState().setVariables(merged);
    }, [composerTree, node]);

    useEffect(() => {
        if (node?.content) {
            const split = node.content.split(/({{.*?}})/g);
            setContentParts(split);
        }
    }, [node]);

    if (!composerTree || !node || !contentParts) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <Text style={{ color: colors.text }}>Loading...</Text>
            </View>
        );
    }

    const usedKeys = (node.content.match(/{{(.*?)}}/g) || []).map((m) =>
        m.replace(/[{}]/g, '').trim()
    );

    return (
        <>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                    {contentParts.map((part, i) => {
                        const match = part.match(/\{\{(.*?)\}\}/);
                        if (match) {
                            const varName = match[1];
                            const variable = useVariableStore.getState().values[varName];

                            return (
                                <TouchableOpacity
                                    key={`chip-${i}`}
                                    onPress={() => {
                                        if (isStringVariable(variable)) {
                                            setTempValue(variable.value ?? '');
                                            setEditingVar(varName);
                                        } else {
                                            onChipPress?.(varName);
                                        }
                                    }}
                                    style={[sharedStyles.chip, { marginRight: 8, marginBottom: 4 }]}
                                >
                                    <Text style={sharedStyles.chipText}>{varName}</Text>
                                </TouchableOpacity>
                            );
                        }

                        return (
                            <Text
                                key={`text-${i}`}
                                style={{
                                    color: colors.text,
                                    fontSize: 16,
                                    lineHeight: 24,
                                    marginRight: 4,
                                }}
                            >
                                {part}
                            </Text>
                        );
                    })}
                </View>

                <View style={{ marginTop: 20 }}>
                    {usedKeys.map((key) => {
                        const variable = useVariableStore.getState().values[key];
                        const value = isStringVariable(variable) ? variable.value.trim() : '[linked prompt]';

                        return (
                            <Text
                                key={`var-summary-${key}`}
                                style={{
                                    fontSize: 14,
                                    color: colors.onSurface,
                                    marginBottom: 4,
                                }}
                            >
                                {key}: {value || '[not set]'}
                            </Text>
                        );
                    })}
                </View>
            </ScrollView>

            {editingVar && (
                <Modal
                    transparent
                    animationType="slide"
                    onRequestClose={() => setEditingVar(null)}
                >
                    <View style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <View style={{
                            backgroundColor: colors.card,
                            padding: 20,
                            borderRadius: 10,
                            width: '80%',
                        }}>
                            <Text style={{ color: colors.text, marginBottom: 10 }}>
                                Enter value for "{editingVar}"
                            </Text>
                            <TextInput
                                value={tempValue}
                                onChangeText={setTempValue}
                                placeholder="Type something..."
                                style={{
                                    borderColor: colors.borderThin,
                                    borderWidth: 1,
                                    padding: 10,
                                    borderRadius: 6,
                                    color: colors.text,
                                    marginBottom: 16,
                                }}
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity
                                    onPress={() => setEditingVar(null)}
                                    style={{
                                        flex: 1,
                                        marginRight: 8,
                                        paddingVertical: 10,
                                        borderRadius: 6,
                                        alignItems: 'center',
                                        backgroundColor: colors.borderThin,
                                    }}
                                >
                                    <Text style={{ color: colors.text }}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        if (editingVar !== null) {
                                            useVariableStore.getState().setVariable(editingVar, {
                                                type: 'string',
                                                value: tempValue,
                                                richCapable: false,
                                            });

                                            if (onVariablesChange) {
                                                const allVars = useVariableStore.getState().values;
                                                const flatVars = Object.fromEntries(
                                                    Object.entries(inferVariablesFromRoot(composerTree)).map(([k, v]) => [k, v.value])
                                                );
                                                onVariablesChange(flatVars);
                                            }

                                            setEditingVar(null);
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 10,
                                        borderRadius: 6,
                                        alignItems: 'center',
                                        backgroundColor: colors.accent,
                                    }}
                                >
                                    <Text style={{ color: '#fff' }}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </>
    );
};
