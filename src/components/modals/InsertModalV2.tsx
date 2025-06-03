import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useColors } from '../../hooks/useColors';

type Props = {
    visible: boolean;
    insertTarget: string;
    onRequestClose: () => void;
    onInsert: (value: string) => void;
    entityType: 'Function' | 'Variable';
};

export default function InsertModalV2({
    visible,
    insertTarget,
    onRequestClose,
    onInsert,
    entityType,
}: Props) {
    const colors = useColors();
    const styles = getStyles(colors);

    const mockOptions = entityType === 'Function'
        ? ['summarize', 'translate', 'formatDate']
        : ['simpleVariable1', 'simpleVariable2'];

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Insert into {insertTarget}</Text>

                    <FlatList
                        data={mockOptions}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => onInsert(item)} style={styles.option}>
                                <Text style={styles.optionText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />

                    <TouchableOpacity onPress={onRequestClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            padding: 24,
        },
        modal: {
            backgroundColor: colors.card,
            borderRadius: 10,
            padding: 20,
            maxHeight: 400,
        },
        title: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 16,
            color: colors.text,
        },
        option: {
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderColor: colors.border,
        },
        optionText: {
            fontSize: 16,
            color: colors.text,
        },
        cancelText: {
            marginTop: 16,
            textAlign: 'center',
            color: colors.primary,
            fontSize: 16,
        },
    });
