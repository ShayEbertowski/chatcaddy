import React from 'react';
import { View, Text } from 'react-native';
import { ComposerRunner } from "../src/components/composer/ComposerRunner";
import { useLocalSearchParams } from 'expo-router';

export default function RunPromptScreen() {
    const { treeId, nodeId } = useLocalSearchParams();

    if (!treeId || !nodeId) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Missing tree or node ID. Please try again from the library screen.</Text>
            </View>
        );
    }

    return (
        <ComposerRunner
            treeId={treeId as string}
            nodeId={nodeId as string}
            readOnly={true}
            allowVariableInput={true}
        />
    );
}
