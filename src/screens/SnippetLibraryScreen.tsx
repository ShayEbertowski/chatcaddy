import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SnippetLibraryScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.placeholder}>🧠 Snippet Library coming soon...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        fontSize: 16,
        color: '#666',
    },
});
