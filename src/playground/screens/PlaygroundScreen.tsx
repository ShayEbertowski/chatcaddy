import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { ThemedButton } from '../../components/ui/ThemedButton';
import { router } from 'expo-router';
import { composerStore } from '../../core/composer/composerStore';
import { runPlaygroundSeeder } from '../../core/composer/utils/PlaygroundSeeder';
import { useColors } from '../../hooks/useColors';
import { PlaygroundModeSelector } from '../components/PlaygroundModeSelector';

export default function PlaygroundScreen() {
    const { rootNode } = composerStore();
    const colors = useColors();

    const handleSeed = () => {
        runPlaygroundSeeder();
    };

    return (
        <ThemedSafeArea>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.title, { color: colors.text }]}>Playground</Text>

                <ThemedButton title="Seed Playground" onPress={handleSeed} />

                {rootNode && <PlaygroundModeSelector rootNodeId={rootNode.id} />}


            </View>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    rootText: { marginTop: 10, fontSize: 14, opacity: 0.6 },
});
