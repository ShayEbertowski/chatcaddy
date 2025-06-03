import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert
} from 'react-native';
import { useNavigation } from 'expo-router';
import { useColors } from '../../src/hooks/useColors';
import { useVariableStore } from '../../src/stores/useVariableStore';
import { getSharedStyles } from '../../src/styles/shared';
import { runPrompt } from '../../src/utils/prompt/runPrompt';
import { usePromptEditorStore } from '../../src/stores/usePromptEditorStore';
import { ThemedSafeArea } from '../../src/components/shared/ThemedSafeArea';
import { PromptVariableEditor } from '../../src/components/prompt/PromptVariableEditor';
import { useFunctionStore } from '../../src/stores/useFunctionStore';
import { PromptResult } from '../../src/components/prompt/PromptResult';
import { RenderPreviewChunks } from '../../src/components/prompt/renderPreviewChunks';

export default function RunPrompt() {
    const prompt = usePromptEditorStore((s) => s.editingPrompt);
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);
    const navigation = useNavigation();

    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        navigation.setOptions({ title: 'Run Prompt' });
    }, [navigation]);

    if (!prompt) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>No prompt loaded.</Text>
            </View>
        );
    }

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

    const handleRun = async () => {
        setIsLoading(true);
        setResponse('');

        // Save to variable store
        Object.entries(inputs).forEach(([key, value]) =>
            useVariableStore.getState().setVariable(key, { type: 'string', value })
        );

        const filledPrompt = prompt.content.replace(/{{(.*?)}}/g, (_, rawVar) => {
            const key = rawVar.split('=')[0].trim();
            return inputs[key] || '';
        });

        const result = await runPrompt(filledPrompt, inputs);

        if ('error' in result) {
            Alert.alert('Error', result.error);
        } else {
            setResponse(result.response);
        }

        setIsLoading(false);
    };

    return (
        <ThemedSafeArea style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.title, { color: colors.accent }]}>{prompt.title}</Text>

                <View >
                    <RenderPreviewChunks content={prompt.content} />
                </View>

                <View style={sharedStyles.divider} />

                <PromptVariableEditor
                    prompt={prompt}
                    initialValues={inputs}
                    onChange={setInputs}
                /> 

                <PromptResult
                    response={response}
                    isLoading={isLoading}
                    onClear={() => setResponse('')}
                />
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.runButton} onPress={handleRun}>
                    <Text style={styles.runButtonText}>Run</Text>
                </TouchableOpacity>
            </View>
        </ThemedSafeArea>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        title: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 20,
        },
        scrollContent: {
            padding: 20,
            paddingBottom: 100,
        },
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        buttonContainer: {
            padding: 20,
            borderTopWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
        },
        runButton: {
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 10,
            alignItems: 'center',
        },
        runButtonText: {
            color: colors.background,
            fontWeight: '600',
            fontSize: 16,
        },
    });
