import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { ThemedButton } from '../../components/ui/ThemedButton';
import { router } from 'expo-router';

interface Props {
    title: string;
}

export function PlaygroundHeader({ title }: Props) {
    const colors = useColors();

    return (
        <View style={[styles.container, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <ThemedButton title="🏠 Playground Home" onPress={() => router.push('/playground')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { paddingBottom: 10, borderBottomWidth: 1, marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold' },
});
