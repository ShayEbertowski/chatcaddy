import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ComposerRunner } from '../../../src/components/composer/ComposerRunner';
import { runPromptFromTree } from '../../../src/utils/prompt/runPromptFromTree';
import { useColors } from '../../../src/hooks/useColors';
import { flattenVariables } from '../../../src/utils/composer/inferVariables';
import { useVariableStore } from '../../../src/stores/useVariableStore';
import { ThemedButton } from '../../../src/components/ui/ThemedButton';
import { PromptResult } from '../../../src/components/prompt/PromptResult';
import CollapsibleSection from '../../../src/components/shared/CollapsibleSection';
import { useComposerStore } from '../../../src/stores/useComposerStore';
import { NavigationButton } from '../../../src/components/ui/NavigationButton';
import { Variable } from '../../../src/types/prompt';
import { flattenToStrings } from '../../../src/utils/variables/flattenToStrings';

export default function RunPromptScreen() {
    const { treeId, nodeId } = useLocalSearchParams();
    const colors = useColors();
    const composerTree = useComposerStore((s) => s.composerTree);
    const [response, setResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showResponse, setShowResponse] = useState(true);
    const [focusedNodeId, setFocusedNodeId] = useState<string | null>(nodeId as string);
    const [editingVar, setEditingVar] = useState<string | null>(null);
    const [tempValue, setTempValue] = useState('');

    if (!treeId || !nodeId) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 16 }}>
                <Text style={{ color: colors.text }}>
                    Missing tree or node ID. Please try again from the library screen.
                </Text>
            </View>
        );
    }

    const handleRun = async () => {

        const allVars = useVariableStore.getState().values;
        const flat = flattenToStrings(allVars); // <- new clean flat strings


        const emptyKeys = Object.entries(flat)
            .filter(([_, value]) => typeof value !== 'string' || value.trim() === '');

        if (emptyKeys.length > 0) {
            Alert.alert(
                'Missing Inputs',
                `Please fill in the following variable${emptyKeys.length > 1 ? 's' : ''}: ${emptyKeys.map(([k]) => k).join(', ')}`,
            );
            return;
        }

        try {
            setIsLoading(true);
            const variableValues: Record<string, Variable> = {};

            for (const [key, value] of Object.entries(flat)) {
                if (value.startsWith('{{') && value.endsWith('}}')) {
                    const promptKey = value.slice(2, -2).trim();
                    const composerNode = composerTree?.nodes?.[promptKey];
                    if (composerNode) {
                        variableValues[key] = {
                            type: 'prompt',
                            promptId: promptKey,
                            promptTitle: composerNode.title,
                        };
                        continue;
                    }
                }

                variableValues[key] = {
                    type: 'string',
                    value,
                    richCapable: false,
                };
            }

            const result = await runPromptFromTree({
                treeId: treeId as string,
                nodeId: nodeId as string,
                variableValues,
            });

            setResponse(result.response ?? '[No output]');
        } catch (err) {
            console.error('Error running prompt:', err);
            Alert.alert('Error', 'There was a problem running the prompt.');
            setResponse('[Error running prompt]');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVariablesChange = useCallback((flatVars: Record<string, string>) => {
        // Optional: sync changes
    }, []);

    const handleChipPress = (name: string) => {
        const allVars = useVariableStore.getState().values;
        const composerTree = useComposerStore.getState().composerTree;
        const variable = allVars[name];

        if (variable?.type === 'string') {
            setTempValue(variable.value ?? '');
            setEditingVar(name);
            return;
        }

        if (variable?.type === 'prompt') {
            const targetNode = composerTree?.nodes?.[variable.promptId];
            if (!targetNode) {
                Alert.alert('Invalid Reference', `No node found for ID: ${variable.promptId}`);
                return;
            }

            const hasVars = targetNode.content.includes('{{');
            if (hasVars) {
                setFocusedNodeId(targetNode.id);
            } else {
                useVariableStore.getState().setVariable(name, {
                    type: 'string',
                    value: '',
                    richCapable: false,
                });
                setTempValue('');
                setEditingVar(name);
            }
            return;
        }

        if (!variable) {
            Alert.alert('Missing Variable', `Variable "${name}" not found.`);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 }}>
                    <View style={{ flex: 1 }}>
                        {focusedNodeId !== nodeId && (
                            <NavigationButton
                                icon="chevron-back"
                                onPress={() => setFocusedNodeId(nodeId as string)}
                            />
                        )}
                    </View>

                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>
                        {composerTree?.nodes?.[focusedNodeId!]?.title || 'Prompt'}
                    </Text>

                    <View style={{ flex: 1 }} />
                </View>

                <ComposerRunner
                    treeId={treeId as string}
                    nodeId={focusedNodeId as string}
                    readOnly={true}
                    allowVariableInput={true}
                    onVariablesChange={handleVariablesChange}
                    onChipPress={handleChipPress}
                />

                {(response !== null || isLoading) && (
                    <CollapsibleSection
                        title="Response"
                        isOpen={showResponse}
                        onToggle={() => setShowResponse(prev => !prev)}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: 20 }} />
                        ) : (
                            <PromptResult
                                response={response ?? ''}
                                isLoading={false}
                                onClear={() => setResponse(null)}
                            />
                        )}
                    </CollapsibleSection>
                )}
            </ScrollView>

            <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 16,
                backgroundColor: colors.background,
                borderTopColor: colors.borderThin,
                borderTopWidth: 1,
            }}>
                <ThemedButton title="Run Prompt" onPress={handleRun} colorKey="primary" />
            </View>
        </View>
    );
}
