import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { ThemedSafeArea } from '../../src/components/shared/ThemedSafeArea';
import { useComposerStore } from '../../src/stores/useComposerStore';
import { ComposerTreeView } from '../../src/components/composer/ComposerTreeView';
import { ThemedButton } from '../../src/components/ui/ThemedButton';
import { ComposerNode } from '../../src/types/composer';
import { generateUUID } from '../../src/utils/uuid/generateUUID';

export default function ComposerScreen() {
    const { rootNode, addChildToNode } = useComposerStore();

    const handleAddRoot = async () => {
        const id = await generateUUID();
        const newNode: ComposerNode = {
            id,
            type: 'prompt',
            title: 'Root Prompt',
            children: [],
        };
        addChildToNode(null, newNode);
    };

    return (
        <ThemedSafeArea>
            {rootNode ? (
                <ComposerTreeView node={rootNode} onAddChild={() => { }} />
            ) : (
                <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 20, color: 'white' }}>No nodes yet</Text>
                    <ThemedButton title="Add Root Node" onPress={handleAddRoot} style={{ marginTop: 20 }} />
                </View>
            )}
        </ThemedSafeArea>
    );
}
