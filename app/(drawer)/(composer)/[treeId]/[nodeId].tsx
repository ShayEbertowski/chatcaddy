// app/(drawer)/(composer)/[treeId]/[nodeId].tsx

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedSafeArea } from '../../../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../../../src/components/ui/ThemedButton';
import { useColors } from '../../../../src/hooks/useColors';
import { useComposerEditingState } from '../../../../src/stores/useComposerEditingState';
import { ComposerEditorView } from '../../../../src/components/composer/ComposerEditorView';
import { useComposerStore } from '../../../../src/stores/useComposerStore';
import SavePromptModal from '../../../../src/components/modals/SavePromptModal';
import { generateSmartTitle } from '../../../../src/utils/prompt/generateSmartTitle';

export default function ComposerNodeScreen() {
    const { treeId, nodeId } = useLocalSearchParams<{
        treeId: string;
        nodeId: string;
    }>();
    const colors = useColors();

    const {
        rootNode,
        currentNode,
        nodePath,
        updateNode,
        insertChildNode,
        saveTree,
        loadTree,
    } = useComposerEditingState(treeId, nodeId);

    const [showSaveModal, setShowSaveModal] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [saveTitle, setSaveTitle] = useState('');
    const [saving, setSaving] = useState(false);

    // Only load the tree once
    const hasLoadedRef = useRef(false);
    useEffect(() => {
        if (!treeId || hasLoadedRef.current) return;
        hasLoadedRef.current = true;
        loadTree(treeId).catch(console.error);
    }, [treeId]);

    // isNewTree logic
    console.log('🧪 DEBUG isNewTree check', {
        rootNode,
        treeId,
        title: rootNode?.title,
        childrenLength: rootNode?.children?.length,
        nodePathLength: nodePath.length,
    });

    const isNewTree =
        rootNode?.id === treeId &&
        (!rootNode?.title || rootNode.title.trim() === '') &&
        (!rootNode.children || rootNode.children.length === 0);

    const readOnly = nodePath.length === 1 && !isNewTree;
    const loading = !currentNode;

    const handleSavePress = async () => {
        if (!currentNode?.content?.trim()) return;
        setIsGeneratingTitle(true);
        try {
            const smart = await generateSmartTitle(currentNode.content);
            setSaveTitle(smart || 'Untitled');
            setShowSaveModal(true);
        } catch (err) {
            console.error('❌ Title generation failed', err);
            setSaveTitle('Untitled');
            setShowSaveModal(true);
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    const handleConfirmSave = async () => {
        setSaving(true);
        try {
            await saveTree();
            setShowSaveModal(false);
        } catch (err) {
            console.error('❌ Save failed', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ThemedSafeArea>
                <ActivityIndicator size="large" color={colors.primary} />
            </ThemedSafeArea>
        );
    }

    if (!currentNode) {
        return (
            <ThemedSafeArea>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: colors.secondaryText, fontSize: 16 }}>
                        ⚠️ Prompt not found. Try creating a new one.
                    </Text>
                    <ThemedButton
                        title="New Prompt"
                        onPress={async () => {
                            try {
                                const { treeId: newTree, rootId } =
                                    await useComposerStore.getState().createEmptyTree();
                                router.replace(`/(drawer)/(composer)/${newTree}/${rootId}`);
                            } catch (err) {
                                console.error('❌ Failed to create new tree', err);
                            }
                        }}
                        style={{ marginTop: 16 }}
                    />
                </View>
            </ThemedSafeArea>
        );
    }

    return (
        <ThemedSafeArea>
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
                {nodePath.length === 1 && readOnly && (
                    <View
                        style={{
                            padding: 8,
                            marginBottom: 8,
                            borderRadius: 6,
                            backgroundColor: 'rgba(255,255,255,0.05)',
                        }}
                    >
                        <Text
                            style={{
                                color: colors.secondaryText,
                                fontStyle: 'italic',
                                textAlign: 'center',
                            }}
                        >
                            Viewing root node – read-only
                        </Text>
                    </View>
                )}

                <ComposerEditorView
                    treeId={treeId}
                    currentNode={currentNode}
                    nodePath={nodePath}
                    onChangeNode={updateNode}
                    onChipPress={insertChildNode}
                    readOnly={readOnly}
                    onSaveTree={!readOnly ? handleSavePress : undefined}
                />
            </View>

            <SavePromptModal
                visible={showSaveModal}
                title={saveTitle}
                prompt={currentNode.content}
                onChangeTitle={setSaveTitle}
                onCancel={() => setShowSaveModal(false)}
                onConfirm={handleConfirmSave}
                selectedFolder=""
                loading={isGeneratingTitle || saving}
            />
        </ThemedSafeArea>
    );
}
