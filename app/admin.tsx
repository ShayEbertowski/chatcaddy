import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePromptsStore } from '../src/stores/usePromptsStore';
import { useThemeMode } from '../src/theme/ThemeProvider';
import { light, dark } from '../src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedSafeArea } from '../src/components/shared/ThemedSafeArea';


export default function Admin() {
    const deleteAllPrompts = usePromptsStore((s) => s.deleteAll);
    const seedSampleData = usePromptsStore((s) => s.seedSampleData);
    const { theme } = useThemeMode();
    const isDark = theme === 'dark';
    const colors = isDark ? dark : light;
    const router = useRouter();

    return (
        <ThemedSafeArea>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} />
                </TouchableOpacity>
                <View style={[styles.screen, { backgroundColor: colors.background }]}>
                    <Text style={[styles.header, { color: colors.text }]}>🧪 Developer Tools</Text>

                    <TouchableOpacity onPress={deleteAllPrompts}>
                        <Text style={[styles.item, { color: colors.text }]}>🧨 Delete All Prompts</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={seedSampleData}>
                        <Text style={[styles.item, { color: colors.text }]}>🌱 Seed Sample Data</Text>
                    </TouchableOpacity>
                </View>
        </ThemedSafeArea>

    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: 24,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    item: {
        fontSize: 16,
        paddingVertical: 12,
    },
});
