import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { ComposerNode } from '../../types/composer';
import { useColors } from '../../hooks/useColors';
import { useComposerStore } from '../../stores/useComposerStore';

interface Props {
    node: ComposerNode;
    level?: number;
    onAddEntity: (parentId: string) => void;
}

export function ComposerTreeView({ node, level = 0, onAddEntity }: Props) {
    const colors = useColors();
    const styles = getStyles(colors);
    const indent = level * 20;
    const { updateStringValue, insertStringChild } = useComposerStore();

    return (
        <View style={{ marginLeft: indent, marginVertical: 4 }}>
            <View style={styles.nodeContainer}>
                {node.type === 'string' ? (
                    <TextInput
                        style={styles.input}
                        placeholder="Type here..."
                        value={node.value || ''}
                        onChangeText={(newText) => updateStringValue(node.id, newText)}
                    />
                ) : (
                    <Text style={styles.nodeText}>[{node.type}] {node.title}</Text>
                )}

                <TouchableOpacity onPress={() => insertStringChild(node.id)} style={styles.smallButton}>
                    <Text style={styles.smallButtonText}>s+</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => onAddEntity(node.id)} style={styles.addButton}>
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            {node.children.map((child) => (
                <ComposerTreeView key={child.id} node={child} level={level + 1} onAddEntity={onAddEntity} />
            ))}
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        nodeContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            backgroundColor: colors.surface,
            marginBottom: 4,
        },
        nodeText: {
            fontSize: 16,
            color: colors.text,
            flex: 1,
            marginRight: 8,
        },
        input: {
            fontSize: 16,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            flex: 1,
            marginRight: 8,
            color: colors.text,
        },
        smallButton: {
            padding: 4,
            backgroundColor: colors.primary,
            borderRadius: 4,
            marginRight: 6,
        },
        smallButtonText: {
            color: colors.onPrimary,
            fontWeight: 'bold',
        },
        addButton: {
            padding: 4,
            backgroundColor: colors.accent,
            borderRadius: 4,
        },
        addButtonText: {
            color: colors.onPrimary,
            fontWeight: 'bold',
        },
    });
