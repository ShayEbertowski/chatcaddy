import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '../../../src/hooks/useColors';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';

export default function DevToolsScreen() {
    const colors = useColors();
    const router = useRouter();

    return (
        <ThemedSafeArea>
            <View style={styles.container}>
                <Text style={[styles.header, { color: colors.text }]}>Developer Tools</Text>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.accent }]}
                    onPress={() => router.push('/dev/SeedIdeasScreen')}
                >
                    <Text style={styles.buttonText}>Seed Working Notes</Text>
                </TouchableOpacity>

                {/* 🔧 You can add more dev buttons here as you build */}
            </View>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: { fontSize: 22, marginBottom: 40, fontWeight: 'bold' },
    button: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8, marginBottom: 16 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
