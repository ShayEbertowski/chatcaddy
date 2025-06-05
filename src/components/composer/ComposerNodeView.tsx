import React, { useState } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { ComposerNode } from '../../types/composer';
import { useComposerStore } from '../../stores/useComposerStore';
import { useRouter } from 'expo-router';
import { useColors } from '../../hooks/useColors';
import { getSharedStyles } from '../../styles/shared';
import { generateUUID } from '../../utils/uuid/generateUUID';
import { InsertChildModal } from './modals/InsertChildModal';
import BaseModal from '../modals/BaseModal';
import { ThemedButton } from '../ui/ThemedButton';

interface Props {
    node: ComposerNode;
}

export function ComposerNodeView({ node }: Props) {
    const { addChild } = useComposerStore();
    const router = useRouter();

    const colors = useColors();
    const styles = getStyles(colors);
    const sharedStyles = getSharedStyles(colors);

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [insertModalVisible, setInsertModalVisible] = useState(false);
    const [tempValue, setTempValue] = useState(node.value || '');

    const handleInsert = async (type: 'string' | 'prompt' | 'function' | 'snippet') => {
        const id = await generateUUID();
        const childNode: ComposerNode = {
            id,
            type,
            title: `New ${type}`,
            value: type === 'string' ? '' : undefined,
            children: [],
        };
        addChild(node.id, childNode);
    };

    const handleEditValue = () => {
        setEditModalVisible(true);
    };

    const handleSave = () => {
        useComposerStore.setState((state) => {
            const updateTree = (n: ComposerNode): ComposerNode => {
                if (n.id === node.id) return { ...n, value: tempValue };
                return { ...n, children: n.children?.map(updateTree) };
            };
            return { root: updateTree(state.root) };
        });
        setEditModalVisible(false);
    }

    return (
        <View style={styles.node}>
            <Text style={styles.title}>{node.title}</Text>

            <Button title="Add Child" onPress={() => setInsertModalVisible(true)} />

            {node.type === 'string' && (
                <>
                    <TouchableOpacity style={styles.valueBox} onPress={handleEditValue}>
                        <Text>{node.value || 'Tap to edit value'}</Text>
                    </TouchableOpacity>

                    <BaseModal visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)} blur animationType='slide'>
                        <Text style={styles.title}>Edit Value</Text>
                        <TextInput
                            value={tempValue}
                            onChangeText={setTempValue}
                            placeholder="Enter value"
                            style={styles.input}
                        />

                        <ThemedButton
                            title="Save"
                            onPress={handleSave}
                            style={{ marginTop: 20 }}
                            textStyle={{ fontSize: 18 }}
                            colorKey='primary'
                        />

                    </BaseModal>
                </>
            )}

            {node.children?.map((child) => (
                <TouchableOpacity key={child.id} onPress={() => router.push(`/composer/${child.id}`)}>
                    <Text style={styles.child}>{child.title}</Text>
                </TouchableOpacity>
            ))}

            <InsertChildModal
                visible={insertModalVisible}
                onClose={() => setInsertModalVisible(false)}
                onSelect={handleInsert}
            />
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
        input: { borderBottomWidth: 1, padding: 10, marginTop: 10, marginBottom: 20, color: colors.text },
    });