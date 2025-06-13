import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { ComposerNode } from '../../core/types/composer';
import { flattenComposerTree } from '../../core/composer/utils/flattenComposerTree';
import { useColors } from '../../hooks/useColors';
import { useComposerStore } from '../../core/composer/useComposerStore';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ComposerViewerScreen() {
    const colors = useColors();
    const rootNode = useComposerStore.getState().rootNode;
    const flatNodes = flattenComposerTree(rootNode);
    const [index, setIndex] = useState(0);

    if (!rootNode) return (
        <ThemedSafeArea>
            <Text style={{ padding: 20 }}>No Composer Tree Loaded</Text>
        </ThemedSafeArea>
    );

    return (
        <ThemedSafeArea>
            <FlatList
                data={flatNodes}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={e => {
                    const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                    setIndex(newIndex);
                }}
                renderItem={({ item }) => (
                    <View style={[styles.page, { backgroundColor: colors.background }]}>
                        <Text style={[styles.title, { color: colors.text, opacity: getOpacity(item, index, flatNodes) }]}>
                            {item.node.title}
                        </Text>
                        <Text style={[styles.content, { color: colors.text, opacity: getOpacity(item, index, flatNodes) }]}>
                            {item.node.content}
                        </Text>
                    </View>
                )}
                keyExtractor={(item) => item.node.id}
            />
            <View style={styles.breadcrumbs}>
                {flatNodes.map((item, i) => (
                    <TouchableOpacity key={item.node.id} onPress={() => setIndex(i)}>
                        <View style={[styles.dot, { backgroundColor: i === index ? colors.accent : colors.border }]}>
                            <Text style={{ fontSize: 10, color: colors.text }}>{item.node.entityType}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>


        </ThemedSafeArea>
    );
}

// 🧮 Opacity based on depth (very simple fade for now)
function getOpacity(item: { node: ComposerNode; depth: number }, index: number, nodes: { node: ComposerNode; depth: number }[]) {
    const activeDepth = nodes[index]?.depth ?? 0;
    const diff = Math.abs(item.depth - activeDepth);
    return 1 - Math.min(diff * 0.25, 0.75);
}

const styles = StyleSheet.create({
    page: {
        width: SCREEN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    content: {
        fontSize: 18,
    },
    breadcrumbs: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginHorizontal: 4,
    },
    entityType: {
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 8,
    },

});
