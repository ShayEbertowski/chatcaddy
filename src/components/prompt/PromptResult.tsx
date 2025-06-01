import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { getSharedStyles } from '../../styles/shared';

type PromptResultProps = {
    response: string;
    isLoading: boolean;
    onClear: () => void;
};

export function PromptResult({ response, isLoading, onClear }: PromptResultProps) {
    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);
    const styles = getStyles(colors);

    if (isLoading) {
        return (
            <View style={sharedStyles.loadingContainer}>
                <Text style={sharedStyles.loadingText}>Running...</Text>
            </View>
        );
    }

    if (!response) {
        return (
            <Text style={sharedStyles.placeholderText}>
                Response will appear here after you run the prompt.
            </Text>
        );
    }

    return (
        <View style={styles.resultContainer}>
            <View style={styles.headerRow}>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={onClear}>
                    <Text style={sharedStyles.clearButton}>Clear</Text>
                </TouchableOpacity>
            </View>

            <Text style={sharedStyles.response}>{response}</Text>
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        resultContainer: {
            flexDirection: 'column',
            gap: 8,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
    });
