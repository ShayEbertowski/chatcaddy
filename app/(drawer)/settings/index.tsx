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
import { loadUserPreferences, saveUserPreferences } from '../../../src/utils/preferences/preferences';
import { useThemeStore } from '../../../src/stores/useThemeStore';
import { saveApiKey, getApiKey, clearApiKey } from '../../../src/utils/apiKeyStorage';

export default function Settings() {
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState('');
    const [editable, setEditable] = useState(true);
    const [hasSavedKey, setHasSavedKey] = useState(false);
    const [tapBehavior, setTapBehavior] = useState('preview');

    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);
    const { mode, setMode } = useThemeStore();

    // Zustand store for settings
    const confirmPromptDelete = useSettingsStore((s) => s.confirmPromptDelete);
    const setConfirmPromptDelete = useSettingsStore((s) => s.setConfirmPromptDelete);
    const navigation = useNavigation();

    useEffect(() => {
        const loadAllSettings = async () => {
            const storedKey = await getApiKey();
            if (storedKey) {
                setApiKey(storedKey);
                setHasSavedKey(true);
                setEditable(false);
            }

            const prefs = await loadUserPreferences();
            if (!prefs) return;

            if (prefs.tap_behavior) {
                setTapBehavior(prefs.tap_behavior);
            }
        };

        loadAllSettings();
    }, []);

    const saveApiKey = async (key: string) => {
        try {
            await saveApiKey(key);
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
            await clearApiKey();
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
            saveApiKey(apiKey);
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
            <ScrollView contentContainerStyle={sharedStyles.scroll}>
                {/* API Key */}
                <View style={{ opacity: 0.5, pointerEvents: 'none' }}>
                    <View style={sharedStyles.section}>
                        <Text style={sharedStyles.sectionTitle}>OpenAI API Key (disabled for beta)</Text>
                        <Text style={{ color: colors.secondaryText, fontSize: 12, marginBottom: 6 }}>
                            API Key management will be available in a future release.
                        </Text>

                        <TextInput
                            value={apiKey}
                            onChangeText={setApiKey}
                            placeholder="sk-..."
                            secureTextEntry
                            editable={editable}
                            style={[sharedStyles.input, !editable && sharedStyles.disabledInput]}
                        />
                        <View style={sharedStyles.keyActionsRow}>
                            <View style={styles.leftButtonRow}>
                                <TouchableOpacity style={sharedStyles.actionButton} onPress={handleEditOrSave}>
                                    <Text style={sharedStyles.actionButtonText}>{editable ? 'Save' : 'Edit'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={sharedStyles.actionButton} onPress={handleTestKey}>
                                    <Text style={sharedStyles.actionButtonText}>Test</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.clearButton} onPress={confirmClearKey}>
                                <Text style={sharedStyles.clearButtonText}>Clear Key</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>


                {/* Tap Behavior */}
                <View style={{ opacity: 0.5, pointerEvents: 'none' }}>
                    <View style={sharedStyles.section}>
                        <Text style={sharedStyles.sectionTitle}>Default Tap Action (coming soon)</Text>
                        <View style={sharedStyles.toggleRow}>
                            <TouchableOpacity
                                style={[
                                    sharedStyles.toggleButton,
                                    tapBehavior === 'preview' && sharedStyles.toggleButtonSelected,
                                ]}
                                onPress={() => saveTapBehavior('preview')}
                            >
                                <Text
                                    style={[
                                        sharedStyles.toggleButtonText,
                                        tapBehavior === 'preview' && sharedStyles.toggleButtonTextSelected,
                                    ]}
                                >
                                    Preview
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    sharedStyles.toggleButton,
                                    tapBehavior === 'run' && sharedStyles.toggleButtonSelected,
                                ]}
                                onPress={() => saveTapBehavior('run')}
                            >
                                <Text
                                    style={[
                                        sharedStyles.toggleButtonText,
                                        tapBehavior === 'run' && sharedStyles.toggleButtonTextSelected,
                                    ]}
                                >
                                    Run
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>


                {/* Appearance */}
                <View style={sharedStyles.section}>
                    <Text style={sharedStyles.sectionTitle}>Appearance</Text>
                    <View style={sharedStyles.toggleRow}>
                        <TouchableOpacity
                            style={[
                                sharedStyles.toggleButton,
                                mode === 'light' && sharedStyles.toggleButtonSelected,
                            ]}
                            onPress={() => setMode('light')}
                        >
                            <Text style={[
                                sharedStyles.toggleButtonText,
                                mode === 'light' && sharedStyles.toggleButtonTextSelected,
                            ]}>Light</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                sharedStyles.toggleButton,
                                mode === 'dark' && sharedStyles.toggleButtonSelected,
                            ]}
                            onPress={() => setMode('dark')}
                        >
                            <Text style={[
                                sharedStyles.toggleButtonText,
                                mode === 'dark' && sharedStyles.toggleButtonTextSelected,
                            ]}>Dark</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Prompt Confirm */}
                <View style={sharedStyles.section}>
                    <Text style={sharedStyles.sectionTitle}>Prompt Behavior</Text>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Confirm before deleting prompts</Text>
                        <Switch
                            value={confirmPromptDelete}
                            onValueChange={setConfirmPromptDelete}
                            trackColor={{
                                false: colors.switchTrackOff,
                                true: colors.switchTrackOn
                            }}
                        />
                        </View>
                </View>
            </ScrollView>
        </ThemedSafeArea>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        settingRow: {
            backgroundColor: colors.card,
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
        leftButtonRow: {
            flexDirection: 'row',
            gap: 12,
        },
        clearButton: {
            marginLeft: 12,
            alignSelf: 'center',
            paddingRight: 4
        },
    });

Settings.options = {
    title: 'Settings',
};
