import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

type PromptCardProps = {
    title: string;
    content: string;
    onPress: () => void;
};

export default function PromptCard({ title, content, onPress }: PromptCardProps) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardPreview} numberOfLines={2}>
                {content}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardPreview: {
        color: '#555',
        fontSize: 14,
    },
});
