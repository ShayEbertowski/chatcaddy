import React, { useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedSafeArea } from './ThemedSafeArea';
import BaseModal from './BaseModal';
import { runPrompt } from '../utils/runPrompt'; // adjust path if needed
import { useVariableStore } from '../stores/useVariableStore';


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

    const [showDetails, setShowDetails] = useState(false);
    const onCancel = () => setShowDetails(false);

    const [showResultModal, setShowResultModal] = useState(false);
    const [resultText, setResultText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState('');

    const handleRunPrompt = async () => {
        setResponse('');
        setIsLoading(true);
        setShowResultModal(true);

        const filledValues = useVariableStore.getState().values;
        const result = await runPrompt(content, filledValues); // or pass full prompt object if needed

        if ('error' in result) {
            setResponse(`⚠️ ${result.error}`);
        } else {
            setResponse(result.response);
        }

        setIsLoading(false);
    };


    return (
        <ThemedSafeArea>
            <View style={styles.card}>
                <TouchableOpacity
                    onPress={() => setShowDetails(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                        {title}
                    </Text>
                    <Text style={styles.content} numberOfLines={1} ellipsizeMode="tail">
                        {content}
                    </Text>
                </TouchableOpacity>

                <View style={styles.actions}>
                    <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
                        <MaterialIcons name="edit" size={20} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
                        <MaterialIcons name="delete" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleRunPrompt} style={styles.iconButton}>
                        <MaterialIcons name="play-arrow" size={20} color="#34C759" />
                    </TouchableOpacity>
                </View>

                <BaseModal visible={showDetails} onRequestClose={onCancel} blur>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalContent}>{content}</Text>
                    <TouchableOpacity onPress={() => setShowDetails(false)}>
                        <Text style={{ color: '#007AFF', textAlign: 'center', marginTop: 16 }}>
                            Close
                        </Text>
                    </TouchableOpacity>
                </BaseModal>

                <BaseModal visible={showResultModal} onRequestClose={() => setShowResultModal(false)} blur>
                    <Text style={styles.modalTitle}>Prompt Output</Text>
                    {isLoading ? (
                        <Text style={styles.modalContent}>Loading...</Text>
                    ) : (
                        <Text style={styles.modalContent}>{resultText}</Text>
                    )}
                    <TouchableOpacity onPress={() => setShowResultModal(false)}>
                        <Text style={{ color: '#007AFF', textAlign: 'center', marginTop: 16 }}>Close</Text>
                    </TouchableOpacity>
                </BaseModal>


            </View>

        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 7, // was 2
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
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#111',
    },
    modalContent: {
        fontSize: 15,
        color: '#333',
    },

});
