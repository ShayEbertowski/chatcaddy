import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ComposerRunner } from '../../../src/components/composer/ComposerRunner';
import { runPromptFromTree } from '../../../src/utils/prompt/runPromptFromTree';
import { useColors } from '../../../src/hooks/useColors';
import { flattenVariables } from '../../../src/utils/composer/inferVariables';
import { useVariableStore } from '../../../src/stores/useVariableStore';
import { ThemedButton } from '../../../src/components/ui/ThemedButton';
import { PromptResult } from '../../../src/components/prompt/PromptResult';
import CollapsibleSection from '../../../src/components/shared/CollapsibleSection';
import { useComposerStore } from '../../../src/stores/useComposerStore';


export default function RunPromptScreen() {
    const { treeId, nodeId } = useLocalSearchParams();
    const colors = useColors();
    const [response, setResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showResponse, setShowResponse] = useState(true);

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
        const flat = flattenVariables(allVars);

        const emptyKeys = Object.entries(flat)
            .filter(([_, value]) => typeof value !== 'string' || value.trim() === '')


        if (emptyKeys.length > 0) {
            Alert.alert(
                'Missing Inputs',
                `Please fill in the following variable${emptyKeys.length > 1 ? 's' : ''}: ${emptyKeys.join(', ')}`,
            );
            return;
        }

        try {
            setIsLoading(true);
            const result = await runPromptFromTree({
                treeId: treeId as string,
                nodeId: nodeId as string,
                variableValues: flat,
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
        // Optional: capture or persist variable changes
    }, []);

    const handleChipPress = (name: string) => {
        const allVars = useVariableStore.getState().values;
        const composerTree = useComposerStore.getState().composerTree;
        const variable = allVars[name];

        if (variable?.type === 'prompt') {
            const targetNode = composerTree?.nodes?.[variable.promptId];
            const hasUnfilledVariables = targetNode?.content?.includes('{{');

            if (targetNode && hasUnfilledVariables) {
                router.push(`/(drawer)/(composer)/${treeId}/${targetNode.id}`);
                return;
            }
        }

        // fallback: show modal or no-op
        Alert.alert('Variable Info', `This variable is a string or already resolved.`);
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
                <ComposerRunner
                    treeId={treeId as string}
                    nodeId={nodeId as string}
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

            <View
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 16,
                    backgroundColor: colors.background,
                    borderTopColor: colors.borderThin,
                    borderTopWidth: 1,
                }}
            >
                <ThemedButton
                    title="Run Prompt"
                    onPress={handleRun}
                    colorKey="primary"
                />
            </View>
        </View>
    );
}
