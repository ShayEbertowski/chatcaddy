// app/pick-prompt.tsx
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { loadPrompts } from '../src/utils/prompt/promptManager';
import { Prompt } from '../src/types/prompt';
import { useColors } from '../src/hooks/useColors';

export default function PickPromptScreen() {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const router = useRouter();
    const { target } = useLocalSearchParams<{ target?: string }>();
    const colors = useColors();

    useEffect(() => {
        loadPrompts().then(setPrompts);
    }, []);

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
                    <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
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
