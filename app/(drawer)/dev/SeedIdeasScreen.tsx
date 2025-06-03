import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { useColors } from '../../../src/hooks/useColors';
import { useIdeaStore } from '../../../src/stores/useIdeaStore';

export default function SeedIdeasScreen() {
    const colors = useColors();
    const addIdea = useIdeaStore((state) => state.addIdea);
    const deleteIdea = useIdeaStore((state) => state.deleteIdea);
    const ideas = useIdeaStore((state) => state.ideas);
    const [isLoading, setIsLoading] = useState(false);

    const notes = [
        "🧭 Reference Note: # Prompt System Design Notes",
        "Onboarding tiers (Kid / Adult / Pro)",
        "Demos screen to explain usage",
        "Animated splash screen",
        // (etc: full list here)
    ];

    const handleSeed = async () => {
        setIsLoading(true);
        try {
            for (const note of notes) {
                const existing = ideas.find(i => i.content === note);
                if (existing) {
                    await deleteIdea(existing.id); // delete existing duplicate
                }
                await addIdea(note); // insert fresh version
            }
            Alert.alert('✅ Done!', 'Duplicates replaced and seeding complete.');
        } catch (err) {
            console.error(err);
            Alert.alert('❌ Error', 'Something went wrong while seeding.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemedSafeArea>
            <View style={styles.container}>
                <Text style={[styles.header, { color: colors.text }]}>
                    Seed Working Notes
                </Text>

                {isLoading ? (
                    <ActivityIndicator size="large" color={colors.accent} />
                ) : (
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.accent }]}
                        onPress={handleSeed}
                    >
                        <Text style={styles.buttonText}>Seed Ideas</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: { fontSize: 20, marginBottom: 24 },
    button: { paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
