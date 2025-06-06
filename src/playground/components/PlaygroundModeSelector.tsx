import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ThemedButton } from '../../components/ui/ThemedButton';
import { router } from 'expo-router';
import { useColors } from '../../hooks/useColors';

interface Props {
    rootNodeId: string;
}

export function PlaygroundModeSelector({ rootNodeId }: Props) {
    const colors = useColors();

    return (
        <View style={styles.container}>
            <ThemedButton title="Seed Playground" onPress={() => router.push('/playground')} />

            <ThemedButton title="Swipe Mode" onPress={() => router.push('/playground/swipe')} />
            <ThemedButton title="Builder Mode" onPress={() => router.push(`/playground/builder/${rootNodeId}`)} />
            <ThemedButton title="Debugger Mode" onPress={() => router.push('/playground/debugger')} />
            <ThemedButton title="Flatten Preview" onPress={() => router.push('/playground/preview')} />
            <ThemedButton title="Composer Editor" onPress={() => router.push('/playground/editor')} />
            <ThemedButton title="Tree Explorer" onPress={() => router.push('/playground/tree')} />
            <ThemedButton title="Composer Canvas" onPress={() => router.push('/playground/canvas')} />

            <Text style={[styles.rootText, { color: colors.text }]}>
                Current Root Node: {rootNodeId}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 20, gap: 10 },
    rootText: { marginTop: 20, fontSize: 14, opacity: 0.6, textAlign: 'center' },
});
