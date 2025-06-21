import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useColors } from '../../hooks/useColors';
import { RenderPreviewChunks } from './RenderPreviewChunks';
import { getSharedStyles } from '../../styles/shared';
import { supabase } from '../../lib/supabaseClient';
import { IndexedEntity } from '../../types/entity';
import { useComposerStore } from '../../stores/useComposerStore';
import { router } from 'expo-router';

export default function PromptSearch() {
    const [entities, setEntities] = useState<IndexedEntity[]>([]);
    const [search, setSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);

    useEffect(() => {
        if (!isFocused) return;

        (async () => {
            const { data, error } = await supabase
                .from('indexed_entities')
                .select('*');
            if (error) console.error('Error fetching indexed_entities:', error);
            setEntities(data ?? []);
        })();
    }, [isFocused]);

    const filtered = !isFocused
        ? []
        : entities.filter((entity) => {
            const q = search.toLowerCase().trim();
            if (!q) return true;
            return (
                entity.title?.toLowerCase().includes(q) ||
                entity.content?.toLowerCase().includes(q) ||
                Object.values(entity.variables ?? {})
                    .map((v: any) =>
                        v.type === 'string'
                            ? v.value?.toLowerCase?.() ?? ''
                            : v.promptTitle?.toLowerCase?.() ?? ''
                    )
                    .join(' ')
                    .includes(q)
            );
        });

    return (
        <View style={styles.container}>
            <Text style={[sharedStyles.label, { color: colors.accent }]}>
                Search for a prompt
            </Text>

            <TextInput
                placeholder="Type to search..."
                value={search}
                onChangeText={setSearch}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                    if (search.trim() === '') setIsFocused(false);
                }}
                style={styles.searchInput}
                placeholderTextColor={colors.placeholder}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {filtered.length ? (
                    filtered.map((entity) => (
                        <TouchableOpacity
                            key={entity.id}
                            style={styles.promptItem}
                            onPress={async () => {
                                try {
                                    console.log('📦 Entity selected:', entity);

                                    const { treeId, rootId } = await useComposerStore
                                        .getState()
                                        .forkTreeFromEntity(entity);

                                    console.log('🧪 Forked tree:', {
                                        treeId,
                                        rootId,
                                        fromEntity: entity.id,
                                    });

                                    router.push(`/(drawer)/(composer)/${treeId}/${rootId}`);
                                } catch (err) {
                                    console.error('❌ Failed to fork and navigate:', err);
                                }
                            }}

                        >
                            <Text style={styles.promptTitle}>
                                {entity.title || '(Untitled)'}
                            </Text>
                            <View style={styles.previewRow}>
                                <RenderPreviewChunks content={entity.content ?? ''} />
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.emptyState}>
                        {search.trim()
                            ? 'No matching prompts found.'
                            : 'Start typing to find prompts...'}
                    </Text>
                )}
            </ScrollView>
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: { flex: 1, padding: 20 },
        searchInput: {
            borderWidth: 1,
            borderRadius: 8,
            padding: 10,
            borderColor: colors.border,
            marginBottom: 12,
            color: colors.text,
            backgroundColor: colors.inputBackground,
        },
        promptItem: {
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderColor: colors.borderThin,
        },
        promptTitle: {
            fontWeight: '500',
            fontSize: 16,
            color: colors.text,
            marginBottom: 6,
        },
        previewRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
        },
        scrollContent: { paddingBottom: 100 },
        emptyState: {
            textAlign: 'center',
            color: colors.secondaryText,
            fontStyle: 'italic',
            marginTop: 20,
            fontSize: 15,
        },
    });
