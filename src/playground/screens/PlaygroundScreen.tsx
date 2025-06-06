import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { ThemedButton } from '../../components/ui/ThemedButton';
import { useColors } from '../../hooks/useColors';
import { useComposerStore } from '../../stores/useComposerStore';
import { runPlaygroundSeeder } from './PlaygroundSeeder';

export default function PlaygroundScreen() {
    const colors = useColors();
    const { rootNode } = useComposerStore();
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        setLoading(true);
        await runPlaygroundSeeder(5);
        setLoading(false);
    };


    return (
        <ThemedSafeArea>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>Playground</Text>

            <ThemedButton title={loading ? "Seeding..." : "Seed Playground"} onPress={handleSeed} />

            {rootNode ? (
                <View style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.text }}>Current Root Node:</Text>
                    <Text style={{ color: colors.text }}>{rootNode.title}</Text>
                </View>
            ) : (
                <Text style={{ color: colors.secondaryText, marginTop: 20 }}>No tree loaded yet</Text>
            )}
        </ThemedSafeArea>
    );
}
