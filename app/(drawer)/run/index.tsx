import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ComposerRunner } from '../../../src/components/composer/ComposerRunner';
import { runPromptFromTree } from '../../../src/utils/prompt/runPromptFromTree';


export default function RunPromptScreen() {
    const { treeId, nodeId } = useLocalSearchParams();
    const [variables, setVariables] = useState<Record<string, any>>({});
    const [output, setOutput] = useState<string | null>(null);

    if (!treeId || !nodeId) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Missing tree or node ID. Please try again from the library screen.</Text>
            </View>
        );
    }

    const handleRun = async () => {
        try {
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

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <ComposerRunner
                treeId={treeId as string}
                nodeId={nodeId as string}
                readOnly={true}
                allowVariableInput={true}
                onVariablesChange={setVariables}
            />
            <Button title="Run Prompt" onPress={handleRun} />
            {output && (
                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontWeight: 'bold' }}>Output:</Text>
                    <Text>{output}</Text>
                </View>
            )}
        </View>
    );
}
