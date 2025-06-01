import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Prompt } from '../../types/prompt';
import { usePromptStore } from '../../stores/usePromptsStore';
import { useColors } from '../../hooks/useColors';

type Props = {
    onSelect: (prompt: Prompt) => void;
};

export default function PromptSearch({ onSelect }: Props) {
    const prompts = usePromptStore((state) => state.prompts);
    const [search, setSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const colors = useColors();
    const styles = getStyles(colors);
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
            <Text style={styles.heading}>Search for a prompt</Text>

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
                    filtered.map((prompt) => (
                        <TouchableOpacity
                            key={prompt.id}
                            onPress={() => onSelect(prompt)}
                            style={styles.promptItem}
                        >
                            <Text style={styles.promptTitle}>
                                {String(prompt.title || '(Untitled)')}
                            </Text>
                            <Text style={styles.promptContent} numberOfLines={1}>
                                {String(prompt.content || '')}
                            </Text>
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
            borderColor: '#ccc',
            marginBottom: 12,
        },
        promptItem: {
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderColor: colors.borderThin,
        },
        promptTitle: {
            fontWeight: '500',
            fontSize: 16,
            color: colors.onPrimary
        },
        promptContent: {
            fontSize: 14,
            color: colors.secondaryText,
        },
        scrollContent: {
            paddingBottom: 100,
        },
        emptyState: {
            textAlign: 'center',
            color: '#999',
            fontStyle: 'italic',
            marginTop: 20,
            fontSize: 15,
        },
    });
