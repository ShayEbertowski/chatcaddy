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

        async function fetchEntities() {
            const { data, error } = await supabase
                .from('indexed_entities')
                .select('*');

            if (error) {
                console.error('Error fetching indexed_entities:', error);
                return;
            }

            setEntities(data ?? []);
        }

        fetchEntities();
    }, [isFocused]);

    const filtered = !isFocused
        ? []
        : entities.filter((entity) => {
            const query = search.toLowerCase().trim();
            if (query === '') return true;

            const titleMatch = entity.title?.toLowerCase().includes(query) ?? false;
            const contentMatch = entity.content?.toLowerCase().includes(query) ?? false;
            const variableText = Object.values(entity.variables ?? {})
                .map((v: any) => {
                    if (v.type === 'string') return v.value?.toLowerCase?.() ?? '';
                    if (v.type === 'prompt') return v.promptTitle?.toLowerCase?.() ?? '';
                    return '';
                })
                .join(' ');
            const variableMatch = variableText.includes(query);

            return titleMatch || contentMatch || variableMatch;
        });

    return (
        <View style={styles.container}>
            <Text style={[sharedStyles.label, { color: colors.accent }]}>Search for a prompt</Text>

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
                {filtered.length > 0 ? (
                    filtered.map((entity) => (
                        <TouchableOpacity
                            key={entity.id}
                            onPress={async () => {
                                try {
                                    const { treeId, rootId } = await useComposerStore.getState().forkTreeFromEntity(entity);
                                    router.push(`/(drawer)/(composer)/${treeId}/${rootId}`);
                                } catch (err) {
                                    console.error('❌ Failed to fork and navigate:', err);
                                }
                            }}
                            style={styles.promptItem}
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
                        {search.trim() === ''
                            ? 'Start typing to find prompts...'
                            : 'No matching prompts found.'}
                    </Text>
                )}
            </ScrollView>
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
        },
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
        scrollContent: {
            paddingBottom: 100,
        },
        emptyState: {
            textAlign: 'center',
            color: colors.secondaryText,
            fontStyle: 'italic',
            marginTop: 20,
            fontSize: 15,
        },
    });
