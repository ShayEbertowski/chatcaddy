import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type PromptCardProps = {
    title: string;
    content: string;
    onPress: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onRun: () => void;
};

export default function PromptCard({
    title,
    content,
    onPress,
    onEdit,
    onDelete,
    onRun,
}: PromptCardProps) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
            <Text style={styles.title} numberOfLines={2}>
                “{title}”
            </Text>

            <Text style={styles.content} numberOfLines={3}>
                {content}
            </Text>

            <View style={styles.actions}>
                <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
                    <MaterialIcons name="edit" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
                    <MaterialIcons name="delete" size={20} color="#FF3B30" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onRun} style={styles.iconButton}>
                    <MaterialIcons name="play-arrow" size={20} color="#34C759" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
        marginBottom: 6,
    },
    content: {
        fontSize: 14,
        color: '#555',
        marginBottom: 12,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
    },
    iconButton: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 6,
    },
});
