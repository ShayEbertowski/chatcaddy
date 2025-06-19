import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import PromptSearch from '../../../src/components/prompt/PromptSearch';
import EmptyState from '../../../src/components/shared/EmptyState';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { useColors } from '../../../src/hooks/useColors';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useComposerStore } from '../../../src/stores/useComposerStore';
import { supabase } from '../../../src/lib/supabaseClient';
import { IndexedEntity } from '../../../src/types/entity';
import { navigateToTree } from '../../../src/utils/composer/navigation';
import { forkTreeFrom } from '../../../src/utils/composer/forkTreeFrom';

export default function ComposerIndexScreen() {
    const colors = useColors();
    const router = useRouter();
    const [prompts, setPrompts] = useState<IndexedEntity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPrompts() {
            const { data, error } = await supabase
                .from('indexed_entities')
                .select('*')
                .eq('entity_type', 'Prompt');

            if (error) {
                console.error('Error loading prompts:', error);
                return;
            }

            setPrompts(data ?? []);
            setLoading(false);
        }

        fetchPrompts();
    }, []);

    const hasPrompts = prompts.length > 0;

    return (
        <ThemedSafeArea disableTopInset>
            <View style={{ flex: 1, padding: 16 }}>
                {hasPrompts ? (
                    <PromptSearch/>

                ) : (
                    <EmptyState
                        title="No Prompts Yet"
                        subtitle="Create your first prompt to begin composing."
                        buttonLabel="New Prompt"
                        onButtonPress={async () => {
                            try {
                                const { treeId, rootId } = await useComposerStore.getState().createEmptyTree();
                                navigateToTree(treeId, rootId);
                            } catch (err) {
                                console.error('❌ Failed to create new tree', err);
                            }
                        }}
                    />
                )}

                <TouchableOpacity
                    onPress={async () => {
                        try {
                            const { treeId, rootId } = await useComposerStore.getState().createEmptyTree();
                            navigateToTree(treeId, rootId);
                        } catch (err) {
                            console.error('❌ Failed to create new tree', err);
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
