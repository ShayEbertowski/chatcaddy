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
import { useRoute } from '@react-navigation/native';
import BaseModal from '../src/components/modals/BaseModal';
import { useColors } from '../src/hooks/useColors';
import { useFunctionStore } from '../src/stores/useFunctionStore';
import { useVariableStore } from '../src/stores/useVariableStore';
import { getSharedStyles, placeholderText } from '../src/styles/shared';
import { Prompt } from '../src/types/prompt';
import { runPrompt } from '../src/utils/prompt/runPrompt';


export default function RunPrompt() {
    const { params } = useRoute<any>();
    const prompt: Prompt = params.prompt;
    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);

    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [insertTarget, setInsertTarget] = useState<string | null>(null);
    const [showInsertModal, setShowInsertModal] = useState(false);


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
    <ScrollView style={styles.container}>
        <Text style={styles.title}>{prompt.title}</Text>

        {(prompt.content.match(/{{(.*?)}}/g) || []).map((match, index) => {
            const variableName = match.replace(/[{}]/g, '').split('=')[0].trim();
            return (
                <View key={index} style={styles.inputGroup}>
                    <View style={styles.inputLabelRow}>
                        <Text style={styles.label}>{variableName}</Text>
                        <TouchableOpacity onPress={() => {
                            setInsertTarget(variableName);
                            setShowInsertModal(true);
                        }}>
                            <Text style={{ color: colors.primary, fontSize: 16 }}>＋</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.input}
                        value={inputs[variableName]}
                        onChangeText={(text) =>
                            setInputs((prev) => ({ ...prev, [variableName]: text }))
                        }
                        placeholder={`Enter ${variableName}`}
                        placeholderTextColor={colors.text}
                    />
                </View>
            );
        })}

        {showInsertModal && insertTarget && (
            <BaseModal
                visible
                blur
                onRequestClose={() => {
                    setShowInsertModal(false);
                    setInsertTarget(null);
                }}
            >
                <Text style={styles.title}>Insert Function</Text>
                {useFunctionStore.getState().functions.map((fn) => (
                    <TouchableOpacity
                        key={fn.id}
                        style={{ paddingVertical: 10 }}
                        onPress={() => {
                            setInputs((prev) => ({
                                ...prev,
                                [insertTarget]: fn.value,
                            }));
                            setShowInsertModal(false);
                            setInsertTarget(null);
                        }}
                    >
                        <Text style={{ color: colors.primary }}>{fn.name}</Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    onPress={() => {
                        setShowInsertModal(false);
                        setInsertTarget(null);
                    }}
                    style={[styles.button, { marginTop: 16 }]}
                >
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </BaseModal>
        )}


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
                <Text style={placeholderText}>Response will appear here after you run the prompt.</Text>
            )}
        </View>

        <TouchableOpacity style={styles.runButton} onPress={handleRun}>
            <Text style={styles.runButtonText}>Run Prompt</Text>
        </TouchableOpacity>
    </ScrollView>
);
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: {
            padding: 20,
            backgroundColor: colors.background,
        },
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
            color: colors.text,
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
        runButton: {
            marginTop: 20,
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: 'center',
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
        cancelText: {}

    });
