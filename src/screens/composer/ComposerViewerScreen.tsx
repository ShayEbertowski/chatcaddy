import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { ComposerNode } from '../../core/types/composer';
import { useColors } from '../../hooks/useColors';
import { composerStore } from '../../core/composer/composerStore';
import { flattenComposerTree } from '../../core/composer/utils/flattenComposerTree';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ComposerViewerScreen() {
    const colors = useColors();
    const rootNode = composerStore.getState().rootNode;
    const flatNodes = flattenComposerTree(rootNode ?? null);
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
                        <Text style={[styles.title, { color: colors.text }]}>{item.node.title}</Text>
                        <Text style={[styles.content, { color: colors.text }]}>{item.node.content}</Text>
                    </View>
                )}
                keyExtractor={(item) => item.node.id}
            />
        </ThemedSafeArea>
    );
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
});
