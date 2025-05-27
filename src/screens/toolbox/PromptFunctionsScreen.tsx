import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { useColors } from '../../hooks/useColors';

const FUNCTION_STORAGE_KEY = '@function_library';

export default function PromptFunctionsScreen() {
    const colors = useColors();
    const styles = getStyles(colors);

    const [name, setName] = useState('');
    const [value, setValue] = useState('');

    const handleSave = async () => {
        if (!name.trim() || !value.trim()) {
            Alert.alert('Missing Info', 'Please enter both a name and value.');
            return;
        }

        try {
            const stored = await AsyncStorage.getItem(FUNCTION_STORAGE_KEY);
            const existing = stored ? JSON.parse(stored) : [];

            const newFunction = {
                id: uuidv4(),
                title: name.trim(),
                content: value.trim(),
                folder: 'all-functions', // or whatever folder logic you use
            };

            const updated = [...existing, newFunction];
            await AsyncStorage.setItem(FUNCTION_STORAGE_KEY, JSON.stringify(updated));

            setName('');
            setValue('');
            Alert.alert('✅ Saved', 'Function created successfully!');
        } catch (err) {
            console.error('Failed to save function:', err);
            Alert.alert('Error', 'Failed to save function.');
        }
    };

    return (
        <ThemedSafeArea>
            <View style={styles.container}>
                <Text style={styles.label}>Function Name</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Summarize Text"
                    style={styles.input}
                />

                <Text style={styles.label}>Function Content</Text>
                <TextInput
                    value={value}
                    onChangeText={setValue}
                    placeholder='e.g. Summarize this: "{{input}}"'
                    style={[styles.input, styles.textArea]}
                    multiline
                />

                <TouchableOpacity onPress={handleSave} style={styles.button}>
                    <Text style={styles.buttonText}>Save Function</Text>
                </TouchableOpacity>
            </View>
        </ThemedSafeArea>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: {
            padding: 20,
        },
        label: {
            fontSize: 14,
            color: colors.text,
            marginBottom: 4,
            marginTop: 16,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            color: colors.text,
            padding: 12,
            borderRadius: 8,
            fontSize: 16,
        },
        textArea: {
            height: 100,
            textAlignVertical: 'top',
        },
        button: {
            marginTop: 24,
            backgroundColor: colors.primary,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
        },
        buttonText: {
            color: colors.background,
            fontWeight: '600',
            fontSize: 16,
        },
    });
