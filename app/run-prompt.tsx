import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useColors } from '../src/hooks/useColors';
import { ThemedSafeArea } from '../src/components/shared/ThemedSafeArea';
import { EntityVariableEditor } from '../src/components/entity/EntityVariableEditor';
import { getSharedStyles } from '../src/styles/shared';
import { Variable } from '../src/types/prompt';
import { useVariableStore } from '../src/stores/useVariableStore';
import { useComposerStore } from '../src/stores/useComposerStore';
import { runPrompt } from '../src/utils/prompt/runPrompt';

export default function RunPromptScreen() {
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);
    const navigation = useNavigation();

    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { id } = useLocalSearchParams<{ id?: string | string[] }>();
    const treeId = Array.isArray(id) ? id[0] : id;

    const loadTree = useComposerStore((s) => s.loadTree);
    const isLoaded = useComposerStore((s) => treeId ? s.loadedTreeIds.has(treeId) : false);
    const tree = useComposerStore((s) => s.composerTree);

    const root = tree?.nodes?.[tree?.rootId];

    useEffect(() => {
        navigation.setOptions({ title: 'Run Prompt' });
    }, [navigation]);

    useEffect(() => {
        if (!treeId || isLoaded) return;

        console.log('📥 Loading tree:', treeId);
        loadTree(treeId).catch((err) => {
            console.error('❌ Failed to load tree:', err);
            Alert.alert('Error', 'Failed to load prompt.');
        });
    }, [treeId, isLoaded, loadTree]);

    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!root?.variables || hasInitialized.current) return;

        const initial: Record<string, string> = {};
        Object.entries(root.variables as Record<string, Variable>).forEach(([k, v]) => {
            initial[k] = resolveInitialValue(v);
        });

        setInputs(initial);
        hasInitialized.current = true;
    }, [root?.variables]);

    if (!treeId || !isLoaded || !root) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Loading prompt…</Text>
            </View>
        );
    }

    const handleRun = async () => {
        setIsLoading(true);
        setResponse('');

        Object.entries(inputs).forEach(([key, value]) => {
            const variableDef = root.variables?.[key] as Variable | undefined;
            if (!variableDef) return;

            switch (variableDef.type) {
                case 'string':
                    useVariableStore.getState().setVariable(key, {
                        type: 'string',
                        value,
                        richCapable: variableDef.richCapable,
                    });
                    break;
                case 'prompt':
                    useVariableStore.getState().setVariable(key, {
                        type: 'prompt',
                        promptId: variableDef.promptId,
                        promptTitle: value,
                    });
                    break;
            }
        });

        const filledPrompt = (root.content ?? '').replace(/{{(.*?)}}/g, (_, rawVar) => {
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
                <Text style={[styles.title, { color: colors.accent }]}>
                    {root.title || '(Untitled)'}
                </Text>

                <EntityVariableEditor
                    prompt={root}
                    onChange={setInputs}
                />

                {response ? (
                    <View style={sharedStyles.response}>
                        <Text style={{ color: colors.text }}>{response}</Text>
                    </View>
                ) : null}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.runButton} onPress={handleRun} disabled={isLoading}>
                    <Text style={styles.runButtonText}>{isLoading ? 'Running…' : 'Run'}</Text>
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
