import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Prompt } from '../../types/prompt';
import { useColors } from '../../hooks/useColors';
import { PromptVariableEditor } from '../prompt/PromptVariableEditor';
import { useFunctionStore } from '../../stores/useFunctionStore';
import { RenderPreviewChunks } from '../prompt/renderPreviewChunks';

type PromptComposerProps = {
    prompt: Prompt;
    onZoomIntoPrompt: (id: string) => void;
};

export default function PromptComposer({ prompt, onZoomIntoPrompt }: PromptComposerProps) {
    const colors = useColors();
    const styles = getStyles(colors);
    const [inputs, setInputs] = useState<Record<string, string>>({});

    useEffect(() => {
        const initial: Record<string, string> = {};
        Object.entries(prompt.variables ?? {}).forEach(([k, v]) => {
            if (v.type === 'string') {
                initial[k] = v.value ?? '';
            }
        });
        setInputs(initial);
    }, [prompt]);


    useEffect(() => {
        useFunctionStore.getState().loadFunctions();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{prompt.title}</Text>

            <View style={styles.contentContainer}>
                    <RenderPreviewChunks content={prompt.content} />
            </View>

            <View style={styles.variablesContainer}>
                <PromptVariableEditor
                    prompt={prompt}
                    initialValues={inputs}
                    onChange={setInputs}
                />
            </View>
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: {
            padding: 16,
            gap: 12,
            backgroundColor: colors.background,
            flex: 1,
        },
        title: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.accent,
        },
        contentContainer: {
            marginTop: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            backgroundColor: colors.card,
        },
        label: {
            fontWeight: '500',
            marginBottom: 4,
            color: colors.text,
        },
        contentText: {
            color: colors.text,
        },
        variablesContainer: {
            marginTop: 20,
        },
    });
