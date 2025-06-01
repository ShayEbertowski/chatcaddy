import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { useFunctionStore } from '../../stores/useFunctionStore';

type InsertModalV2Props = {
    visible: boolean;
    insertTarget: string;
    onInsert: (value: string) => void;
    onRequestClose: () => void;
    entityType: 'Function';
};

export default function InsertModalV2({ visible, insertTarget, onInsert, onRequestClose, entityType }: InsertModalV2Props) {
    const colors = useColors();
    const styles = getStyles(colors);

    const functions = useFunctionStore((s) => s.functions);

    if (!visible) return null;

    const handleInsert = (functionId: string, functionTitle: string) => {
        // This could be more advanced later, for now just pass title as value
        onInsert(functionTitle);
        onRequestClose();
    };

    return (
        <View style={styles.modalContainer}>
            <Text style={styles.header}>Insert {entityType}</Text>

            {functions.length === 0 ? (
                <Text style={styles.noFunctions}>No Functions available</Text>
            ) : (
                <ScrollView>
                    {functions.map((func) => (
                        <TouchableOpacity
                            key={func.id}
                            onPress={() => handleInsert(func.id, func.title)}
                            style={styles.functionItem}
                        >
                            <Text style={styles.functionText}>{func.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            <TouchableOpacity onPress={onRequestClose} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
    modalContainer: {
        padding: 20,
        borderRadius: 16,
    },
    header: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: colors.accent,
    },
    noFunctions: {
        textAlign: 'center',
        marginVertical: 20,
        color: colors.text,
    },
    functionItem: {
        paddingVertical: 10,
    },
    functionText: {
        fontSize: 16,
        color: colors.text,
    },
    cancelButton: {
        marginTop: 20,
    },
    cancelText: {
        color: colors.warning,
        textAlign: 'center',
        fontWeight: '500',
    },
});
