import React, { useState } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { ComposerNode } from '../../types/composer';
import { useComposerStore } from '../../stores/useComposerStore';
import { useRouter } from 'expo-router';
import { generateUUID } from '../../utils/uuid/generateUUID';
import { useColors } from '../../hooks/useColors';
import { getSharedStyles } from '../../styles/shared';

interface Props {
    node: ComposerNode;
}

export function ComposerNodeView({ node }: Props) {
    const { addChild } = useComposerStore();
    const router = useRouter();

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [tempValue, setTempValue] = useState(node.value || '');

    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);

    const handleAddString = async () => {
        const id = await generateUUID();
        addChild(node.id, {
            id,
            type: 'string',
            title: 'New String',
            value: '',
        });
    };

    const handleEditValue = () => {
        setEditModalVisible(true);
    };

    return (
        <View style={styles.node}>
            <Text style={styles.title}>{node.title}</Text>

            <Button title="Add String Child" onPress={handleAddString} />

            {/* Value editing */}
            {node.type === 'string' && (
                <>
                    <TouchableOpacity style={styles.valueBox} onPress={handleEditValue}>
                        <Text>{node.value || 'Tap to edit value'}</Text>
                    </TouchableOpacity>

                    <Modal visible={editModalVisible} transparent animationType="slide">
                        <View style={styles.modalContainer}>
                            <View style={styles.modalBox}>
                                <Text>Edit Value</Text>
                                <TextInput
                                    value={tempValue}
                                    onChangeText={setTempValue}
                                    placeholder="Enter value"
                                    style={styles.input}
                                />
                                <Button
                                    title="Save"
                                    onPress={() => {
                                        useComposerStore.setState((state) => {
                                            const updateTree = (n: ComposerNode): ComposerNode => {
                                                if (n.id === node.id) return { ...n, value: tempValue };
                                                return { ...n, children: n.children?.map(updateTree) };
                                            };
                                            return { root: updateTree(state.root) };
                                        });
                                        setEditModalVisible(false);
                                    }}
                                />
                            </View>
                        </View>
                    </Modal>
                </>
            )}

            {node.children?.map((child) => (
                <TouchableOpacity key={child.id} onPress={() => router.push(`/composer/${child.id}`)}>
                    <Text style={styles.child}>{child.title}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        node: { padding: 20 },
        title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: colors.accent },
        child: { fontSize: 16, padding: 5, backgroundColor: '#ddd', marginVertical: 5 },
        valueBox: {
            padding: 10,
            borderWidth: 1,
            borderColor: '#ccc',
            marginVertical: 10,
            borderRadius: 5,
        },
        modalContainer: {
            flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
        },
        modalBox: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: 300 },
        input: { borderBottomWidth: 1, padding: 10, marginTop: 10, marginBottom: 20 },
    });
