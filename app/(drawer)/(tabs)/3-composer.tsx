import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Prompt } from '../../../src/types/prompt';
import { useColors } from '../../../src/hooks/useColors';
import { useAuthStore } from '../../../src/stores/useAuthStore';
import PromptSearch from '../../../src/components/prompt/PromptSearch';
import RichPromptEditor from '../../../src/components/editor/RichPromptEditor';
import { useVariableStore } from '../../../src/stores/useVariableStore';
import PromptComposer from '../../../src/components/composer/PromptComposer';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { usePromptStore } from '../../../src/stores/usePromptsStore';

export default function Composer() {
    const prompts = usePromptStore((state) => state.prompts);
    const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
    const [history, setHistory] = useState<Prompt[]>([]);
    const [isPicking, setIsPicking] = useState(true);
    const [mode, setMode] = useState<'search' | 'create'>('search');
    const [newText, setNewText] = useState('');
    const [newType, setNewType] = useState<'Prompt' | 'Function' | 'Snippet'>('Prompt');
    const colors = useColors();
    const styles = getStyles(colors);
    const router = useRouter();

    const initialized = useAuthStore((state) => state.initialized);
    const loadPrompts = usePromptStore((state) => state.loadPrompts);

    useEffect(() => {
        if (initialized) {
            loadPrompts();
        }
    }, [initialized]);

    const zoomIntoPrompt = (id: string) => {
        const next = prompts.find(p => p.id === id);
        if (!next) return;
        setHistory(prev => [...prev, currentPrompt!]);
        setCurrentPrompt(next);
    };


    const zoomOut = () => {
        const newHistory = [...history];
        const prev = newHistory.pop();
        if (prev) {
            setCurrentPrompt(prev);
            setHistory(newHistory);
        }
    };

    if (isPicking) {
        return (
            <ThemedSafeArea>
                <View style={{ flex: 1 }}>
                    {/* 🧭 This toggle block stays here, inside the screen */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Start With</Text>
                        <View style={styles.toggleRow}>
                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    mode === 'search' && styles.toggleButtonSelected,
                                ]}
                                onPress={() => setMode('search')}
                            >
                                <Text
                                    style={[
                                        styles.toggleButtonText,
                                        mode === 'search' && styles.toggleButtonTextSelected,
                                    ]}
                                >
                                    Search
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    mode === 'create' && styles.toggleButtonSelected,
                                ]}
                                onPress={() => setMode('create')}
                            >
                                <Text
                                    style={[
                                        styles.toggleButtonText,
                                        mode === 'create' && styles.toggleButtonTextSelected,
                                    ]}
                                >
                                    Create New
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 👇 Then conditional render based on mode */}
                    {mode === 'search' && (
                        <PromptSearch onSelect={(prompt) => {
                            setCurrentPrompt(prompt);
                            setIsPicking(false);
                            setHistory([]);
                        }} />
                    )}

                    {mode === 'create' && (
                        <View style={{ flex: 1, padding: 16 }}>
                            <RichPromptEditor
                                text={newText}
                                onChangeText={setNewText}
                                entityType={newType}
                                onChangeEntityType={setNewType}
                            />
                            <Button
                                title="Use This Prompt"
                                onPress={() => {
                                    const prompt: Prompt = {
                                        id: Date.now().toString(),
                                        title: 'Untitled',
                                        content: newText,
                                        folder: 'default',
                                        type: newType,
                                        variables: useVariableStore.getState().values,

                                    };
                                    setCurrentPrompt(prompt);
                                    setIsPicking(false);
                                    setHistory([]);
                                    setNewText('');
                                }}
                            />
                        </View>
                    )}
                </View>
            </ThemedSafeArea>
        );
    }


    if (!currentPrompt) {
        return
        <ThemedSafeArea>
            <Text style={{ padding: 20, fontSize: 16 }}>Loading...</Text>
        </ThemedSafeArea>;
    }

    return (
        <ThemedSafeArea>
            <View style={{ flex: 1 }}>
                <PromptComposer prompt={currentPrompt} onZoomIntoPrompt={zoomIntoPrompt} />

                {history.length > 0 && (
                    <Button title="‹ Zoom Out" onPress={zoomOut} />
                )}

                <Button
                    title="Pick a different prompt"
                    onPress={() => router.push('/pick-prompt?mode=root')}
                />        </View>
        </ThemedSafeArea>
    );
}


const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        scroll: {
            flexGrow: 1,
            paddingVertical: 32,
            paddingHorizontal: 20,
        },
        section: {
            backgroundColor: colors.card, // use your theme's card color
            padding: 16,
            borderRadius: 10,
            marginBottom: 24,
            shadowColor: colors.cardShadow ?? '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 1,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 12,
            color: colors.text,
        },
        input: {
            borderColor: colors.border,
            borderWidth: 1,
            padding: 10,
            borderRadius: 6,
            fontSize: 16,
            backgroundColor: colors.inputBackground ?? '#f9f9f9',
            color: colors.text,
        },
        disabledInput: {
            backgroundColor: colors.disabledBackground ?? '#eee',
            color: colors.secondaryText,
        },
        keyActionsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 12,
        },
        actionButton: {
            backgroundColor: colors.primary,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
        },
        actionButtonText: {
            color: colors.onPrimary,
            fontWeight: '600',
            fontSize: 14,
        },
        clearButton: {
            marginTop: 12,
            alignSelf: 'center',
        },
        clearButtonText: {
            color: colors.error ?? 'red',
            fontSize: 14,
            fontWeight: '600',
        },
        toggleRow: {
            flexDirection: 'row',
            backgroundColor: colors.toggleBackground ?? colors.inputBackground,
            borderRadius: 8,
            overflow: 'hidden',
            marginTop: 10,
        },
        toggleButton: {
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
        },
        toggleButtonSelected: {
            backgroundColor: colors.primary,
        },
        toggleButtonText: {
            color: colors.text,
            fontWeight: '500',
        },
        toggleButtonTextSelected: {
            color: colors.onPrimary,
            fontWeight: '700',
        },
        settingRow: {
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.border,
            paddingVertical: 14,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
            borderRadius: 10,
        },

        settingLabel: {
            fontSize: 15,
            color: colors.text,
            flexShrink: 1,
            paddingRight: 12,
        },

    });

