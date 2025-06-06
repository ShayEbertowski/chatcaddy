import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ComposerNode } from '../../types/composer';
import { useColors } from '../../hooks/useColors';

interface Props {
    node: ComposerNode;
    level?: number;
    onAddChild: (parentId: string) => void;
}

export function ComposerTreeView({ node, level = 0, onAddChild }: Props) {
    const colors = useColors();
    const styles = getStyles(colors);
    const indent = level * 20;

    return (
        <View style={{ marginLeft: indent, marginVertical: 4 }}>
            <View style={styles.nodeContainer}>
                <Text style={styles.nodeText}>
                    [{node.type}] {node.title}
                </Text>
                <TouchableOpacity onPress={() => onAddChild(node.id)} style={styles.addButton}>
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>

            </View>

            {node.children.map((child) => (
                <ComposerTreeView key={child.id} node={child} level={level + 1} onAddChild={onAddChild} />
            ))}
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        nodeContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 8,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            backgroundColor: colors.surface,
        },
        nodeText: {
            fontSize: 16,
            color: colors.text,
        },
        addButton: {
            padding: 4,
            backgroundColor: colors.primary,
            borderRadius: 4,
        },
        addButtonText: {
            color: colors.onPrimary,
            fontWeight: 'bold',
        },
    });
