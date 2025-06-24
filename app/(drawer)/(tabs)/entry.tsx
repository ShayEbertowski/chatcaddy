import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { useColors } from '../../../src/hooks/useColors';
import { useComposerStore } from '../../../src/stores/useComposerStore';
import { supabase } from '../../../src/lib/supabaseClient';
import { IndexedEntity } from '../../../src/types/entity';
import { navigateToTree } from '../../../src/utils/composer/navigation';

import PromptSearch from '../../../src/components/prompt/PromptSearch';
import EmptyState from '../../../src/components/shared/EmptyState';

export default function ComposerIndexScreen() {
    const colors = useColors();
    const router = useRouter();

    const [rootPrompts, setRootPrompts] = useState<IndexedEntity[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRootPrompts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('indexed_entities')
            .select('*')
            .eq('entity_type', 'Prompt')
            .eq('is_root', true);

        if (error) {
            console.error('Failed to load prompts:', error.message);
            return;
        }

        setRootPrompts(data ?? []);
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchRootPrompts(); // Fire and forget
        }, [fetchRootPrompts])
    );

    const createNewPrompt = async () => {
        try {
            const { treeId, rootId } = await useComposerStore.getState().createEmptyTree();
            navigateToTree(treeId, rootId);
        } catch (err) {
            console.error('❌ Failed to create new tree:', err);
        }
    };

    return (
        <ThemedSafeArea disableTopInset>
            <View style={{ flex: 1, padding: 16 }}>
                {rootPrompts.length > 0 ? (
                    <PromptSearch />
                ) : (
                    <EmptyState
                        title="No Prompts Yet"
                        subtitle="Create your first prompt to begin composing."
                        buttonLabel="New Prompt"
                        onButtonPress={createNewPrompt}
                    />
                )}

                <TouchableOpacity
                    onPress={createNewPrompt}
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
