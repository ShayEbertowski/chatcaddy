import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Alert,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { useColors } from '../../../src/hooks/useColors';
import { useSettingsStore } from '../../../src/stores/useSettingsStore';
import { getSharedStyles } from '../../../src/styles/shared';
import { useThemeMode } from '../../../src/theme/ThemeProvider';
import { loadUserPreferences, saveUserPreferences } from '../../../src/utils/preferences/preferences';
import { loadApiKey } from '../../../src/utils/apiKeyStorage';


const API_KEY_STORAGE_KEY = 'openai_api_key';
const TAP_BEHAVIOR_KEY = '@prompt_tap_behavior';

export default function Settings() {
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState('');
    const [editable, setEditable] = useState(true);
    const [hasSavedKey, setHasSavedKey] = useState(false);
    const [tapBehavior, setTapBehavior] = useState('preview');

    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);
    const { mode, setMode } = useThemeMode(); // mode = 'light' | 'dark' | 'system'

    const confirmPromptDelete = useSettingsStore((s) => s.confirmPromptDelete);
    const setConfirmPromptDelete = useSettingsStore((s) => s.setConfirmPromptDelete);
    const navigation = useNavigation();

    useEffect(() => {
        const loadAllSettings = async () => {
            // load API Key locally
            const storedKey = await loadApiKey();
            if (storedKey) {
                setApiKey(storedKey);
                setHasSavedKey(true);
                setEditable(false);
            }

            // load preferences from DB
            const prefs = await loadUserPreferences();
            if (!prefs) return;

            if (prefs.tap_behavior) {
                setTapBehavior(prefs.tap_behavior);
            }
            if (prefs.appearance_mode) {
                setMode(prefs.appearance_mode);
            }
            if (prefs.confirm_prompt_delete !== undefined) {
                setConfirmPromptDelete(prefs.confirm_prompt_delete);
            }
        };

        loadAllSettings();
    }, []);


    const saveApiKey = async (apiKey: string) => {
        try {
            await saveApiKey(apiKey);  // ← from utils/apiKeyStorage
            Alert.alert('Success', 'API key saved.');
            setStatus('');
            setEditable(false);
            setHasSavedKey(true);
        } catch (error) {
            console.error('Error saving API key:', error);
            Alert.alert('Error', 'Failed to save API key.');
        }
    };

    const clearApiKey = async () => {
        try {
            await clearApiKey(); // from utils/apiKeyStorage
            setApiKey('');
            setStatus('🔒 Key cleared');
            setEditable(true);
            setHasSavedKey(false);
            Alert.alert('Key Removed', 'Your API key has been deleted.');
        } catch (error) {
            console.error('Failed to clear key:', error);
            Alert.alert('Error', 'Could not remove key.');
        }
    };

    const confirmClearKey = () => {
        Alert.alert('Confirm Deletion', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', onPress: clearApiKey, style: 'destructive' },
        ]);
    };

    const saveTapBehavior = async (value: 'preview' | 'run') => {
        try {
            await saveUserPreferences({ tap_behavior: value });
            setTapBehavior(value);
        } catch (error) {
            console.error('Failed to save tap behavior:', error);
        }
    };

    const handleEditOrSave = () => {
        if (editable) {
            saveApiKey(apiKey);  // ✅ pass current state value
        } else {
            setEditable(true);
        }
    };

    const handleTestKey = async () => {
        setStatus('Testing...');
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            });

            if (response.ok) {
                setStatus('✅ Key is valid!');
                Alert.alert('Success', 'Your API key is valid!');
            } else {
                setStatus('❌ Invalid key or network issue.');
                Alert.alert('Error', 'Invalid API key or network error.');
            }
        } catch (error) {
            console.error('Test key error:', error);
            setStatus('❌ Error testing key.');
            Alert.alert('Error', 'Something went wrong while testing the key.');
        }
    };

    return (

        <ThemedSafeArea>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>OpenAI API Key</Text>
                    <TextInput
                        value={apiKey}
                        onChangeText={setApiKey}
                        placeholder="sk-..."
                        secureTextEntry
                        editable={editable}
                        style={[styles.input, !editable && styles.disabledInput]}
                    />
                    <View style={styles.keyActionsRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleEditOrSave}>
                            <Text style={styles.actionButtonText}>{editable ? 'Save' : 'Edit'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButtonSecondary} onPress={handleTestKey}>
                            <Text style={styles.actionButtonText}>Test</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.clearButton} onPress={confirmClearKey}>
                            <Text style={styles.clearButtonText}>Clear Key</Text>
                        </TouchableOpacity>
                    </View>


                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Default Tap Action</Text>
                    <View style={styles.toggleRow}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                tapBehavior === 'preview' && styles.toggleButtonSelected,
                            ]}
                            onPress={() => saveTapBehavior('preview')}
                        >
                            <Text
                                style={[
                                    styles.toggleButtonText,
                                    tapBehavior === 'preview' && styles.toggleButtonTextSelected,
                                ]}
                            >
                                Preview
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                tapBehavior === 'run' && styles.toggleButtonSelected,
                            ]}
                            onPress={() => saveTapBehavior('run')}
                        >
                            <Text
                                style={[
                                    styles.toggleButtonText,
                                    tapBehavior === 'run' && styles.toggleButtonTextSelected,
                                ]}
                            >
                                Run
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Appearance</Text>
                    <View style={styles.toggleRow}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                mode === 'light' && styles.toggleButtonSelected,
                            ]}
                            onPress={() => setMode('light')}
                        >
                            <Text
                                style={[
                                    styles.toggleButtonText,
                                    mode === 'light' && styles.toggleButtonTextSelected,
                                ]}
                            >
                                Light
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                mode === 'dark' && styles.toggleButtonSelected,
                            ]}
                            onPress={() => setMode('dark')}
                        >
                            <Text
                                style={[
                                    styles.toggleButtonText,
                                    mode === 'dark' && styles.toggleButtonTextSelected,
                                ]}
                            >
                                Dark
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                mode === 'system' && styles.toggleButtonSelected,
                            ]}
                            onPress={() => setMode('system')}
                        >
                            <Text
                                style={[
                                    styles.toggleButtonText,
                                    mode === 'system' && styles.toggleButtonTextSelected,
                                ]}
                            >
                                System
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Prompt Behavior</Text>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Confirm before deleting prompts</Text>
                        <Switch
                            value={confirmPromptDelete}
                            onValueChange={setConfirmPromptDelete}
                        />
                    </View>
                </View>


            </ScrollView>
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
            backgroundColor: colors.accent,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
        },
        actionButtonSecondary: {
            borderColor: colors.accent,
            borderWidth: 3,
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
            color: colors.warning ?? 'red',
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

Settings.options = {
    title: 'Settings',
};
function loadPreferences() {
    throw new Error('Function not implemented.');
}

