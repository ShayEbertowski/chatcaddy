import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useColors } from '../../src/hooks/useColors';
import { useVariableStore } from '../../src/stores/useVariableStore';
import { getSharedStyles } from '../../src/styles/shared';
import { runPrompt } from '../../src/utils/prompt/runPrompt';
import { ThemedSafeArea } from '../../src/components/shared/ThemedSafeArea';
import { PromptVariableEditor } from '../../src/components/prompt/PromptVariableEditor';
import { useFunctionStore } from '../../src/stores/useFunctionStore';
import { PromptResult } from '../../src/components/prompt/PromptResult';
import { RenderPreviewChunks } from '../../src/components/prompt/renderPreviewChunks';
import { Prompt, Variable } from '../../src/types/prompt';
import { useEntityStore } from '../../src/stores/useEntityStore';
import { Entity } from '../../src/types/entity';

function isPrompt(entity: Entity): entity is Prompt {
    return entity.entityType === 'Prompt';
}

export default function RunPrompt() {
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);
    const navigation = useNavigation();

    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const rawParams = useLocalSearchParams();
    const idParam = Array.isArray(rawParams.id) ? rawParams.id[0] : rawParams.id;
    const entity = useEntityStore(state => state.entities.find(e => e.id === idParam));

    if (!entity) {
        return (
            <ThemedSafeArea>
                <Text style={{ padding: 20 }}>No entity loaded</Text>
            </ThemedSafeArea>
        );
    }

    useEffect(() => {
        navigation.setOptions({ title: 'Run Prompt' });
    }, [navigation]);

    useEffect(() => {
        const initial: Record<string, string> = {};
        Object.entries(entity.variables ?? {}).forEach(([k, v]) => {
            initial[k] = resolveInitialValue(v);
        });
        setInputs(initial);
    }, [entity]);

    useEffect(() => {
        useFunctionStore.getState().loadFunctions();
    }, []);

    const handleRun = async () => {
        setIsLoading(true);
        setResponse('');

        Object.entries(inputs).forEach(([key, value]) => {
            const variableDef = entity.variables?.[key];
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

        let filledPrompt = '';

        if (isPrompt(entity)) {
            filledPrompt = entity.content.replace(/{{(.*?)}}/g, (_, rawVar) => {
                const key = rawVar.split('=')[0].trim();
                return inputs[key] || '';
            });
        } else {
            Alert.alert('Cannot run this entity type');
            return;
        }

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
                <Text style={[styles.title, { color: colors.accent }]}>{entity.title}</Text>
                <View>
                    <RenderPreviewChunks content={entity.content ?? ''} />
                </View>
                <View style={sharedStyles.divider} />
                {isPrompt(entity) && (
                    <PromptVariableEditor
                        prompt={entity}
                        initialValues={inputs}
                        onChange={setInputs}
                    />
                )}

                <PromptResult response={response} isLoading={isLoading} onClear={() => setResponse('')} />
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
