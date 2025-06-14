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
import { ComposerTreeRecord } from '../../types/composer';

type SimplifiedPrompt = {
    id: string;
    title: string;
    content: string;
};

type Props = {
    onSelect: (prompt: SimplifiedPrompt) => void;
};

export default function PromptSearch({ onSelect }: Props) {
    const [trees, setTrees] = useState<ComposerTreeRecord[]>([]);
    const [search, setSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);

    const [query, setQuery] = useState('');


    useEffect(() => {
        if (!isFocused) return;

        async function fetchTrees() {
            const { data, error } = await supabase
                .from('indexed_entities')
                .select('*');

            if (error) {
                console.error('Error fetching trees:', error);
                return;
            }
            setTrees(data || []);
        }

        fetchTrees();
    }, [isFocused]); // ← only fetch when input is focused


    const filtered = !isFocused
        ? []
        : trees.filter((tree) => {
            const query = search.toLowerCase().trim();
            if (query === '') return true;
            const { title = '', content = '', variables = {} } = tree.tree_data;

            const titleMatch = title.toLowerCase().includes(query);
            const contentMatch = content.toLowerCase().includes(query);
            const variableText = Object.values(variables)
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
                    filtered.map((tree) => (
                        <TouchableOpacity
                            key={tree.id}
                            onPress={() =>
                                onSelect({
                                    id: tree.id,
                                    title: tree.tree_data.title,
                                    content: tree.tree_data.content,
                                })
                            }
                            style={styles.promptItem}
                        >
                            <Text style={styles.promptTitle}>
                                {tree.tree_data.title || '(Untitled)'}
                            </Text>
                            <View style={styles.previewRow}>
                                <RenderPreviewChunks content={tree.tree_data.content} />
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
