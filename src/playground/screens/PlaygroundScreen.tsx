import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { useComposerStore } from '../../stores/useComposerStore';
import { useRouter } from 'expo-router';
import { generatePlaygroundTree } from './PlaygroundSeeder';

export default function PlaygroundScreen() {
    const { rootNode, setRootNode } = useComposerStore();
    const router = useRouter();

    useEffect(() => {
        if (!rootNode) {
            (async () => {
                const tree = await generatePlaygroundTree(5);
                setRootNode(tree);
            })();
        }
    }, [rootNode]);

    if (!rootNode) {
        return (
            <ThemedSafeArea>
                <Text>Loading Playground...</Text>
            </ThemedSafeArea>
        );
    }

    return (
        <ThemedSafeArea>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Playground Root: {rootNode.title}</Text>
            <Button title="Open Root Node" onPress={() => router.push(`/playground/${rootNode.id}`)} />
        </ThemedSafeArea>
    );
}
