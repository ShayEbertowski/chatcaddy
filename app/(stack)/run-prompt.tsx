import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import BaseModal from '../../src/components/modals/BaseModal';
import { useColors } from '../../src/hooks/useColors';
import { useFunctionStore } from '../../src/stores/useFunctionStore';
import { useVariableStore } from '../../src/stores/useVariableStore';
import { getSharedStyles } from '../../src/styles/shared';
import { runPrompt } from '../../src/utils/prompt/runPrompt';
import { usePromptEditorStore } from '../../src/stores/usePromptEditorStore';
import { ThemedSafeArea } from '../../src/components/shared/ThemedSafeArea';
import { useNavigation } from 'expo-router';
import InsertModalV2 from '../../src/components/modals/InsertModalV2';
import { MaterialIcons } from '@expo/vector-icons';


export default function RunPrompt() {
    const prompt = usePromptEditorStore((s) => s.editingPrompt);

    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);

    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [insertTarget, setInsertTarget] = useState<string | null>(null);
    const [showInsertModal, setShowInsertModal] = useState(false);

    const navigation = useNavigation();
    const functions = useFunctionStore((s) => s.functions);

    useEffect(() => {
        navigation.setOptions({
            title: 'Run Prompt',
        });
    }, [navigation]);

    // This must come before any references to prompt, else prompt could be null
    if (!prompt) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>No prompt loaded.</Text>
            </View>
        );
    }

    useEffect(() => {
        const matches = prompt.content.match(/{{(.*?)}}/g) || [];
        const vars = matches.map((m) => m.replace(/[{}]/g, '').split('=')[0].trim());
        const initial: Record<string, string> = {};
        Object.entries(prompt.variables ?? {}).forEach(([k, v]) => {
            if (v.type === 'string') {
                initial[k] = v.value;
            }
        });
        setInputs(initial);
    }, [prompt]);

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

                {(prompt.content.match(/{{(.*?)}}/g) || []).map((match, index) => {
                    const variableName = match.replace(/[{}]/g, '').split('=')[0].trim();
                    return (
                        <View key={index} style={styles.inputGroup}>
                            <View style={styles.inputLabelRow}>
                                <Text style={styles.label}>{variableName}</Text>
                                <TouchableOpacity activeOpacity={0.7}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => {
                                        setInsertTarget(variableName);
                                        setShowInsertModal(true);
                                    }}>
                                    <MaterialIcons name="add-circle" size={28} color={colors.accent} />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.input}
                                value={inputs[variableName]}
                                onChangeText={(text) =>
                                    setInputs((prev) => ({ ...prev, [variableName]: text }))
                                }
                                placeholder={`Enter ${variableName}`}
                                placeholderTextColor={colors.placeholder}
                            />
                        </View>
                    );
                })}

                <View style={sharedStyles.section}>
                    {isLoading ? (
                        <View style={sharedStyles.loadingContainer}>
                            <ActivityIndicator size="small" color={colors.primary} />
                            <Text style={sharedStyles.loadingText}>Running...</Text>
                        </View>
                    ) : response ? (
                        <>
                            <Text style={sharedStyles.response}>{response}</Text>
                            <TouchableOpacity onPress={() => setResponse('')}>
                                <Text style={sharedStyles.clearButton}>Clear</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <Text style={sharedStyles.placeholderText}>Response will appear here after you run the prompt.</Text>
                    )}
                </View>
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
        inputGroup: {
            marginBottom: 16,
        },
        label: {
            fontSize: 14,
            color: colors.accent,
            marginBottom: 4,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.inputBackground,
            color: colors.text,
            padding: 10,
            borderRadius: 8,
        },
        runButtonText: {
            color: colors.background,
            fontWeight: '600',
            fontSize: 16,
        },
        inputLabelRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
        },
        button: {},
        cancelText: {
            color: colors.text
        },
        scrollContent: {
            padding: 20,
            paddingBottom: 100,  // extra bottom padding so content never gets hidden behind button
        },
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        buttonContainer: {
            padding: 20,
            borderTopWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,  // optional: makes button bar stand out
        },
        runButton: {
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 10,
            alignItems: 'center',
        },

    });
