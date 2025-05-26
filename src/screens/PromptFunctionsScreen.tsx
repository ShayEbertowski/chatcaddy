import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedSafeArea } from '../components/ThemedSafeArea';
import { useColors } from '../hooks/useColors';

export default function PromptFunctionsScreen() {
    const colors = useColors();
    const styles = getStyles(colors);

    return (
        <ThemedSafeArea>
            <View style={styles.container}>
                <Text style={styles.text}>Prompt Functions coming soon!</Text>
            </View>
        </ThemedSafeArea>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: {
            padding: 20,
        },
        text: {
            fontSize: 16,
            color: colors.text,
        },
    });
