// src/app/(drawer)/(composer)/[treeId]/[nodeId].tsx
import React, { useEffect, useRef, useState, startTransition } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Snackbar } from 'react-native-paper';

import { ThemedSafeArea } from '../../../../src/components/shared/ThemedSafeArea';
import { useColors } from '../../../../src/hooks/useColors';
import { useComposerEditingState } from '../../../../src/stores/useComposerEditingState';
import { useComposerStore, ComposerNode } from '../../../../src/stores/useComposerStore';
import { ComposerEditorView } from '../../../../src/components/composer/ComposerEditorView';
import SavePromptModal from '../../../../src/components/modals/SavePromptModal';
import { generateSmartTitle } from '../../../../src/utils/prompt/generateSmartTitle';

const goHome = () => startTransition(() => router.replace('/entry'));

export default function ComposerNodeScreen() {
    const rawParams = useLocalSearchParams();
    const treeId = String(rawParams.treeId);
    const nodeId = String(rawParams.nodeId);
    const screenKey = `${treeId}-${nodeId}`;

    return <ComposerNodeScreenInner key={screenKey} treeId={treeId} nodeId={nodeId} />;
}

function ComposerNodeScreenInner({ treeId, nodeId }: { treeId: string; nodeId: string }) {
    const colors = useColors();
    console.log('🧭 Params:', { treeId, nodeId, type: typeof nodeId });

    const {
        nodePath,
        updateNode,
        insertChildNode,
        saveTree,
        loadTree,
    } = useComposerEditingState(treeId, nodeId);

    const composerTree = useComposerStore((s) => s.composerTree);

    const [showSaveModal, setShowSaveModal] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [saveTitle, setSaveTitle] = useState('');
    const [saving, setSaving] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false);

    const loadedOnce = useRef(false);

    useEffect(() => {
        if (!treeId || loadedOnce.current) return;

        const cached = useComposerStore.getState().composerTree;
        if (cached?.id === treeId) {
            loadedOnce.current = true;
            return;
        }

        loadedOnce.current = true;
        loadTree(treeId).catch(console.error);
    }, [treeId]);

    if (!composerTree) {
        return (
            <ThemedSafeArea>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ textAlign: 'center', marginTop: 10 }}>Loading tree...</Text>
            </ThemedSafeArea>
        );
    }

    const node = composerTree.nodes?.[nodeId];
    if (!node) {
        return (
            <ThemedSafeArea>
                <Text style={{ padding: 20, color: colors.error }}>
                    ⚠️ Node not found in this tree.
                </Text>
            </ThemedSafeArea>
        );
    }

    const handleSavePress = async () => {
        if (!node.content.trim()) return;
        setIsGeneratingTitle(true);
        try {
            const smart = await generateSmartTitle(node.content);
            setSaveTitle(smart || 'Untitled');
        } catch {
            setSaveTitle('Untitled');
        } finally {
            setIsGeneratingTitle(false);
            setShowSaveModal(true);
        }
    };

    const handleConfirmSave = async () => {
        setSaving(true);
        try {
            updateNode({ title: saveTitle });
            await saveTree();
            setShowSaveModal(false);
            setSnackOpen(true);
        } finally {
            setSaving(false);
        }
    };

    return (
        <ThemedSafeArea>
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
                <ComposerEditorView
                    treeId={treeId}
                    currentNode={node}
                    nodePath={nodePath}
                    onChangeNode={updateNode}
                    onChipPress={insertChildNode}
                    onSaveTree={handleSavePress}
                />
            </View>

            <SavePromptModal
                visible={showSaveModal}
                title={saveTitle}
                prompt={node.content}
                onChangeTitle={setSaveTitle}
                onCancel={() => setShowSaveModal(false)}
                onConfirm={handleConfirmSave}
                selectedFolder=""
                loading={isGeneratingTitle || saving}
            />

            <Snackbar
                visible={snackOpen}
                onDismiss={() => {
                    setSnackOpen(false);
                    goHome();
                }}
                duration={1200}
                style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.accentSoft,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    marginHorizontal: 16,
                }}
            >
                <Text style={{ color: colors.onSurface }}>Tree saved!</Text>
            </Snackbar>
        </ThemedSafeArea>
    );
}
