import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Entity } from '../../types/entity';
import { useEntityStore } from '../../stores/useEntityStore';
import { useColors } from '../../hooks/useColors';
import { RenderPreviewChunks } from './RenderPreviewChunks';
import { getSharedStyles } from '../../styles/shared';

type Props = {
    onSelect: (prompt: Entity) => void;
}; 

export default function PromptSearch({ onSelect }: Props) {
    const entities = useEntityStore((state) => state.entities);
    const prompts = entities.filter(e => e.entityType === 'Prompt');
    const [search, setSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);

    const filtered = !isFocused
        ? []
        : prompts.filter((p) => {
            const query = search.toLowerCase().trim();
            if (query === '') return true;

            const titleMatch = p.title.toLowerCase().includes(query);
            const contentMatch = p.content.toLowerCase().includes(query);
            const variableText = Object.values(p.variables ?? {})
                .map((v) => {
                    if (v.type === 'string') return v.value.toLowerCase();
                    if (v.type === 'prompt') return v.promptTitle?.toLowerCase() ?? '';
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
                onBlur={() => { if (search.trim() === '') setIsFocused(false); }}
                style={styles.searchInput}
                placeholderTextColor={colors.placeholder}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {filtered.length > 0 ? (
                    filtered.map((prompt) => (
                        <TouchableOpacity
                            key={prompt.id}
                            onPress={() => onSelect(prompt)}
                            style={styles.promptItem}
                        >
                            <Text style={styles.promptTitle}>{prompt.title || '(Untitled)'}</Text>
                            <View style={styles.previewRow}>
                                <RenderPreviewChunks content={prompt.content} />
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
        heading: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 12,
        },
        searchInput: {
            borderWidth: 1,
            borderRadius: 8,
            padding: 10,
            borderColor: colors.border,
            marginBottom: 12,
            color: colors.text,
            backgroundColor: colors.inputBackground
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
