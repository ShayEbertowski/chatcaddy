import React, { useState } from 'react';
import { Text, View, StyleSheet, SafeAreaView, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { ComposerTreeView } from '../../components/composer/ComposerTreeView';
import { InsertChildModal } from '../../components/composer/modals/InsertChildModal';
import { useColors } from '../../hooks/useColors';
import { useComposerStore } from '../../stores/useComposerStore';
import { ComposerNode } from '../../types/composer';
import { generateUUID } from '../../utils/uuid/generateUUID';
import { ThemedSafeArea } from '../../components/shared/ThemedSafeArea';
import { ThemedButton } from '../../components/ui/ThemedButton';

export default function ComposerScreen() {
    const colors = useColors();
    const styles = getStyles(colors);
    const { rootNode, addChildToNode } = useComposerStore();
    const [targetParentId, setTargetParentId] = useState<string | null>(null);

    const handleAddRoot = async () => {
        const id = await generateUUID();
        const newNode: ComposerNode = {
            id,
            type: 'string',
            value: '',
            children: [],
        };
        addChildToNode(null, newNode);
    };

    return (
        <ThemedSafeArea>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                    {rootNode ? (
                        <ComposerTreeView node={rootNode} onAddEntity={(parentId) => setTargetParentId(parentId)} />
                    ) : (
                        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                            <Text style={{ fontSize: 20, color: 'white' }}>No nodes yet</Text>
                            <ThemedButton title="Add Root Node" onPress={handleAddRoot} style={{ marginTop: 20 }} />
                        </View>
                    )}
                </ScrollView>

                <InsertChildModal
                    visible={targetParentId !== null}
                    onClose={() => setTargetParentId(null)}
                    onInsert={(newNode) => {
                        if (targetParentId) {
                            addChildToNode(targetParentId, newNode);
                        }
                        setTargetParentId(null);
                    }}
                />
            </KeyboardAvoidingView>
        </ThemedSafeArea>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    });
