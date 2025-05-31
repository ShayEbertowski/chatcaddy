import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useColors } from '../src/hooks/useColors';
import { useAuthStore } from '../src/stores/useAuthStore';
import { Prompt } from '../src/types/prompt';
import { usePromptStore } from '../src/stores/usePromptsStore';

export default function PickPromptScreen() {
    const router = useRouter();
    const { target } = useLocalSearchParams<{ target?: string }>();
    const colors = useColors();

    const prompts = usePromptStore((state) => state.prompts);
    const loadPrompts = usePromptStore((state) => state.loadPrompts);
    const initialized = useAuthStore((state) => state.initialized);

    useEffect(() => {
        if (initialized) {
            loadPrompts();
        }
    }, [initialized]);

    const handleSelect = (prompt: Prompt) => {
        router.replace({
            pathname: '/sandbox',
            params: {
                selectedPromptId: prompt.id,
                selectedPromptTitle: prompt.title,
                target,
            },
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={prompts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={[styles.item, { borderColor: colors.border }]} onPress={() => handleSelect(item)}>
                        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                        <Text style={[styles.content, { color: colors.secondaryText }]} numberOfLines={1}>
                            {item.content}
                        </Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={{ color: colors.secondaryText }}>No prompts found</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    item: {
        padding: 12,
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    title: { fontWeight: 'bold', fontSize: 16 },
    content: { fontSize: 14, marginTop: 4 },
});
