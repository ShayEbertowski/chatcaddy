import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import PromptSearch from '../../../src/components/prompt/PromptSearch';
import EmptyState from '../../../src/components/shared/EmptyState';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { useColors } from '../../../src/hooks/useColors';
import { useEntityStore } from '../../../src/stores/useEntityStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { v4 as uuidv4 } from 'uuid';

export default function ComposerIndexScreen() {
    const colors = useColors();
    const router = useRouter();
    const entities = useEntityStore((state) => state.entities);

    const hasPrompts = entities.some((e) => e.entityType === 'Prompt');

    function createEmptyTree() {
        throw new Error('Function not implemented.');
    }

    return (
        <ThemedSafeArea disableTopInset>
            <View style={{ flex: 1, padding: 16 }}>
                {hasPrompts ? (
                    <PromptSearch
                        onSelect={async () => {
                            try {
                                const newId = await createEmptyTree();
                                router.push(`/(drawer)/(composer)/${newId}/${newId}`);
                            } catch (err) {
                                console.error('❌ Failed to create tree', err);
                            }
                        }}
                    />
                ) : (
                    <EmptyState
                        title="No Prompts Yet"
                        subtitle="Create your first prompt to begin composing."
                        buttonLabel="New Prompt"
                        onButtonPress={() => {
                            const newId = uuidv4();
                            router.push(`/(drawer)/(composer)/${newId}/${newId}`);
                        }}
                    />
                )}

                <TouchableOpacity
                    onPress={async () => {
                        try {
                            const newId = await createEmptyTree();
                            router.push(`/(drawer)/(composer)/${newId}/${newId}`);
                        } catch (err) {
                            console.error('❌ Failed to create tree', err);
                        }
                    }}
                    style={{
                        position: 'absolute',
                        bottom: 24,
                        right: 24,
                        backgroundColor: colors.primary,
                        padding: 16,
                        borderRadius: 28,
                        elevation: 4,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                    }}
                >
                    <Ionicons name="add" size={24} color={colors.onPrimary} />
                </TouchableOpacity>
            </View>
        </ThemedSafeArea>
    );
}
