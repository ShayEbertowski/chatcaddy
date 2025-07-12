import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '../../src/hooks/useColors';
import { inferTagsFromText } from '../../src/utils/templates/inferTagsFromText';
import { matchTemplate } from '../../src/utils/templates/templateMatcher';
import { ThemedSafeArea } from '../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../src/components/ui/ThemedButton';


export default function TemplatesScreen() {
    const colors = useColors();
    const router = useRouter();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!input.trim()) return;

        setLoading(true);
        setError('');

        try {
            const tags = inferTagsFromText(input);
            const matched = matchTemplate(tags); // may be null

            router.push({
                pathname: '/templates/review',
                params: {
                    rawInput: input,
                    matchedId: matched?.id ?? '',
                },
            });
        } catch (err) {
            setError('Something went wrong.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <ThemedSafeArea>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View>
                    <Text style={[styles.label, { color: colors.text }]}>
                        What do you want help writing?
                    </Text>

                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder="e.g. I’m a student and need to email my professor"
                        placeholderTextColor={colors.secondaryText}
                        multiline
                        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    />

                    {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
                    {error !== '' && (
                        <Text style={{ color: colors.error, marginTop: 16 }}>{error}</Text>
                    )}
                </View>

                <View style={styles.footer}>
                    <ThemedButton title="Continue" onPress={handleSubmit} colorKey="accent" />
                </View>
            </View>
        </ThemedSafeArea>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 24,
    },
    footer: {
        paddingTop: 16,
    },
    label: {
        fontSize: 20,
        marginBottom: 12,
    },
    input: {
        minHeight: 100,
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
        fontSize: 16,
    },
});
