import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    Pressable,
    TouchableOpacity,
    TextInput,
    Modal,
} from 'react-native';

import { useComposerStore } from '../../stores/useComposerStore';
import { useVariableStore } from '../../stores/useVariableStore';
import { useColors } from '../../hooks/useColors';
import { inferVariablesFromRoot } from '../../utils/composer/inferVariables';
import { getSharedStyles } from '../../styles/shared';

interface ComposerRunnerProps {
    treeId: string;
    nodeId: string;
    readOnly?: boolean;
    allowVariableInput?: boolean;
    onVariablesChange?: (flatVars: Record<string, string>) => void;
}

export const ComposerRunner: React.FC<ComposerRunnerProps> = ({
    treeId,
    nodeId,
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
            <View
                style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 4,
                    paddingVertical: 4,
                }}
            >
                {contentParts.map((part, i) => {
                    const match = part.match(/\{\{(.*?)\}\}/);
                    if (match) {
                        const varName = match[1];
                        return (
                            <TouchableOpacity
                                key={`chip-${i}`}
                                onPress={() => {
                                    const currentVar = useVariableStore.getState().values[varName];
                                    if (currentVar?.type === 'string') {
                                        setTempValue(currentVar.value ?? '');
                                    } else {
                                        setTempValue('');
                                    }

                                    setEditingVar(varName);
                                }}
                                style={sharedStyles.chip}
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
                            }}
                        >
                            {part}
                        </Text>
                    );
                })}
            </View>

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
