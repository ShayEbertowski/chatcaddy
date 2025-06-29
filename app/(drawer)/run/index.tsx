// app/(drawer)/run/index.tsx
import React, { useCallback, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ComposerRunner } from '../../../src/components/composer/ComposerRunner';
import { runPromptFromTree } from '../../../src/utils/prompt/runPromptFromTree';
import { useColors } from '../../../src/hooks/useColors';
import { flattenVariables } from '../../../src/utils/composer/inferVariables';
import { useVariableStore } from '../../../src/stores/useVariableStore';

export default function RunPromptScreen() {
    const { treeId, nodeId } = useLocalSearchParams();
    const colors = useColors();
    const [output, setOutput] = useState<string | null>(null);

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
        try {
            const variables = flattenVariables(useVariableStore.getState().values);
            const result = await runPromptFromTree({
                treeId: treeId as string,
                nodeId: nodeId as string,
                variableValues: variables,
            });

            setOutput(result.response ?? '[No output]');
        } catch (err) {
            console.error('Error running prompt:', err);
            setOutput('[Error running prompt]');
        }
    };

    const handleVariablesChange = useCallback((flatVars: Record<string, string>) => {
        // Do nothing for now or store if needed
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
            <ComposerRunner
                treeId={treeId as string}
                nodeId={nodeId as string}
                readOnly={true}
                allowVariableInput={true}
                onVariablesChange={handleVariablesChange}
            />
            <Button title="Run Prompt" onPress={handleRun} color={colors.primary} />
            {output && (
                <View style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>Output:</Text>
                    <Text style={{ color: colors.text }}>{output}</Text>
                </View>
            )}
        </View>
    );
}
