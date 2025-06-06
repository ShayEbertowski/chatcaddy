import React, { useState } from 'react';
import { Text, View, ScrollView, StyleSheet } from 'react-native';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { useColors } from '../../hooks/useColors';
import { useComposerStore } from '../../stores/useComposerStore';
import { ComposerTreeView } from '../../components/composer/ComposerTreeView';
import { ComposerNode } from '../../types/composer';
import { InsertEntityModal } from '../../components/composer/modals/InsertEntityModal';
import { ThemedButton } from '../../components/ui/ThemedButton';

export default function ComposerScreen() {
    const colors = useColors();
    const styles = getStyles(colors);
    const { rootNode, setRootNode } = useComposerStore();

    const [showInsertModal, setShowInsertModal] = useState(false);

    const handleRootInsert = (newNode: ComposerNode) => {
        setRootNode(newNode);
    };

    return (
        <ThemedSafeArea>
            {rootNode ? (
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <ComposerTreeView node={rootNode} />
                </ScrollView>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No prompts yet</Text>
                    <ThemedSafeArea>
                        <ThemedButton title="+ Add Root Node" onPress={() => setShowInsertModal(true)} />
                    </ThemedSafeArea>
                </View>
            )}

            <InsertEntityModal
                visible={showInsertModal}
                onClose={() => setShowInsertModal(false)}
                onInsert={(newNode) => {
                    handleRootInsert(newNode);
                    setShowInsertModal(false);
                }}
            />
        </ThemedSafeArea>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        contentContainer: { padding: 16 },
        emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        emptyText: { fontSize: 20, color: colors.text },
    });
