import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Prompt } from '../../types/prompt';

type PromptComposerProps = {
    prompt: Prompt;
    onZoomIntoPrompt: (id: string) => void;
};

export default function PromptComposer({ prompt, onZoomIntoPrompt }: PromptComposerProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{prompt.title}</Text>
            <TextInput
                style={styles.contentInput}
                value={prompt.content}
                multiline
                editable={false} // or true if you're allowing editing here
            />

            <View style={styles.variablesContainer}>
                {prompt.variables && Object.entries(prompt.variables).map(([name, val]) => (
                    <View key={name} style={styles.variable}>
                        <Text style={styles.variableLabel}>{name}</Text>

                        {val.type === 'prompt' ? (
                            <TouchableOpacity onPress={() => onZoomIntoPrompt(val.promptId)}>
                                <Text style={styles.zoomLink}>› Zoom into {val.promptTitle ?? 'child prompt'}</Text>
                            </TouchableOpacity>
                        ) : (
                            <TextInput
                                style={styles.variableInput}
                                value={val.value}
                                placeholder="Enter value"
                            />
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
    },
    contentInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    variablesContainer: {
        marginTop: 16,
    },
    variable: {
        marginBottom: 12,
    },
    variableLabel: {
        fontWeight: '500',
    },
    variableInput: {
        marginTop: 6,
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 6,
        padding: 8,
    },
    zoomLink: {
        color: '#3B82F6', // Tailwind blue-500
        marginTop: 4,
    },
});
