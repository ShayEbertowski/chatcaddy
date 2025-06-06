import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useColors } from '../../src/hooks/useColors';
import { useVariableStore } from '../../src/stores/useVariableStore';
import { getSharedStyles } from '../../src/styles/shared';
import { runPrompt } from '../../src/utils/prompt/runPrompt';
import { ThemedSafeArea } from '../../src/components/shared/ThemedSafeArea';
import { useFunctionStore } from '../../src/stores/useFunctionStore';
import { useEntityStore } from '../../src/stores/useEntityStore';
import type { Variable } from '../../src/types/prompt';
import { isPrompt } from '../../src/utils/entity/entityGuards';
import { PromptEntity } from '../../src/types/entity';
import { EntityVariableEditor } from '../../src/components/prompt/EntityVariableEditor';

export default function RunPrompt() {
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);
    const navigation = useNavigation();

    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { id } = useLocalSearchParams<{ id?: string | string[] }>();
    const entityId = Array.isArray(id) ? id[0] : id;
    const entity = useEntityStore().entities.find(e => e.id === entityId);


    if (!entity || !isPrompt(entity)) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>No prompt loaded.</Text>
            </View>
        );
    }

    const prompt: PromptEntity = entity;

    useEffect(() => {
        navigation.setOptions({ title: 'Run Prompt' });
    }, [navigation]);

    useEffect(() => {
        const initial: Record<string, string> = {};
        Object.entries(entity.variables ?? {}).forEach(([k, v]) => {
            initial[k] = resolveInitialValue(v);
        });
        setInputs(initial);
    }, [prompt]);

    useEffect(() => {
        useFunctionStore.getState().loadFunctions();
    }, []);

    const handleRun = async () => {
        setIsLoading(true);
        setResponse('');

        Object.entries(inputs).forEach(([key, value]) => {
            const variableDef = prompt?.variables?.[key];
            if (!variableDef) return;

            if (variableDef.type === 'string') {
                useVariableStore.getState().setVariable(key, {
                    type: 'string',
                    value,
                    richCapable: variableDef.richCapable,
                });
            }

            if (variableDef.type === 'prompt') {
                useVariableStore.getState().setVariable(key, {
                    type: 'prompt',
                    promptId: variableDef.promptId,
                    promptTitle: value,
                });
            }
        });

        const filledPrompt = (prompt.content ?? '').replace(/{{(.*?)}}/g, (_, rawVar) => {
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

                <EntityVariableEditor
                    prompt={prompt}
                    initialValues={inputs}
                    onChange={setInputs}
                />

                {response ? (
                    <View style={sharedStyles.response}>
                        <Text style={{ color: colors.text }}>{response}</Text>
                    </View>
                ) : null}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.runButton} onPress={handleRun}>
                    <Text style={styles.runButtonText}>Run</Text>
                </TouchableOpacity>
            </View>
        </ThemedSafeArea>
    );
}

function resolveInitialValue(variable: Variable): string {
    if (variable.type === 'string') return variable.value ?? '';
    if (variable.type === 'prompt') return variable.promptTitle ?? '';
    return '';
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
