import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Prompt } from '../../types/prompt';
import { loadPrompts } from '../../utils/prompt/promptManager';

type Props = {
    onSelect: (prompt: Prompt) => void;
};

export default function PromptSearch({ onSelect }: Props) {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadPrompts().then(setPrompts);
    }, []);

    useEffect(() => {
        setSearch('');
        setPrompts([]); // optional: force re-fetch
        loadPrompts().then(setPrompts);
    }, []);


    const [isFocused, setIsFocused] = useState(false);

    const filtered = !isFocused
        ? [] // only show results when focused
        : prompts.filter((p) => {
            const query = search.toLowerCase().trim();
            if (query === '') return true; // 👈 show all if no search input

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
                            <Text style={styles.promptSnippet} numberOfLines={1}>
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

const styles = StyleSheet.create({
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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#e5e5e5',
    },
    promptTitle: {
        fontWeight: '500',
        fontSize: 16,
    },
    promptSnippet: {
        fontSize: 14,
        color: '#666',
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
