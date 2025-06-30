import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    Pressable,
    TouchableOpacity,
    TextInput,
    Modal,
    ScrollView,
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
}

function isStringVariable(v: Variable): v is StringVariable {
    return v.type === 'string' && 'value' in v && 'richCapable' in v;
}

export const ComposerRunner: React.FC<ComposerRunnerProps> = ({
    treeId,
    nodeId,
    onVariablesChange,
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

        const inferred = inferVariablesFromRoot(composerTree);
        useVariableStore.getState().setVariables(inferred);

        if (onVariablesChange) {
            const flatVars: Record<string, string> = {};
            for (const [k, v] of Object.entries(inferred)) {
                if (isStringVariable(v)) flatVars[k] = v.value;
            }
            onVariablesChange(flatVars);
        }

        const parts = node.content.split(/(\{\{.*?\}\})/g);
        setContentParts(parts);
    }, [composerTree, node]);

    if (!composerTree || !node || !contentParts) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <Text style={{ color: colors.text }}>Loading...</Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, paddingVertical: 4 }}>
                    {contentParts.map((part, i) => {
                        const match = part.match(/\{\{(.*?)\}\}/);
                        if (match) {
                            const varName = match[1];
                            const variable = useVariableStore.getState().values[varName];
                            let valueDisplay = '[Not Set]';

                            if (variable?.type === 'string') {
                                const stringVar = variable as StringVariable;
                                valueDisplay = `"${stringVar.value}"`;
                            }

                            return (
                                <View key={`chip-${i}`} style={{ alignItems: 'flex-start', marginRight: 8, marginBottom: 12 }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (variable?.type === 'string') {
                                                const stringVar = variable as StringVariable;
                                                setTempValue(stringVar.value ?? '');
                                            } else {
                                                setTempValue('');
                                            }
                                            setEditingVar(varName);
                                        }}
                                        style={sharedStyles.chip}
                                    >
                                        <Text style={sharedStyles.chipText}>{varName}</Text>
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: 12, color: colors.text }}>{valueDisplay}</Text>

                                </View>
                            );
                        }

                        return (
                            <Text
                                key={`text-${i}`}
                                style={{
                                    color: colors.text,
                                    fontSize: 16,
                                    lineHeight: 24,
                                }}
                            >
                                {part}
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
                            <Pressable
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
                                                Object.entries(allVars)
                                                    .filter(([_k, v]): v is StringVariable => isStringVariable(v))
                                                    .map(([k, v]) => [k, v.value])
                                            );
                                            onVariablesChange(flatVars);
                                        }
                                    }
                                    setEditingVar(null);
                                }}
                                style={{
                                    backgroundColor: colors.accent,
                                    paddingVertical: 10,
                                    borderRadius: 6,
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: '#fff' }}>Save</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            )}
        </>
    );
};
