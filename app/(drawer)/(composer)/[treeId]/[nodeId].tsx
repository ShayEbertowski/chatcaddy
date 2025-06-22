// src/app/(drawer)/(composer)/[treeId]/[nodeId].tsx
import React, { useEffect, useRef, useState, startTransition } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Snackbar } from 'react-native-paper';

import { ThemedSafeArea } from '../../../../src/components/shared/ThemedSafeArea';
import { useColors } from '../../../../src/hooks/useColors';
import { useComposerEditingState } from '../../../../src/stores/useComposerEditingState';
import { useComposerStore } from '../../../../src/stores/useComposerStore';
import { ComposerEditorView } from '../../../../src/components/composer/ComposerEditorView';
import SavePromptModal from '../../../../src/components/modals/SavePromptModal';
import { generateSmartTitle } from '../../../../src/utils/prompt/generateSmartTitle';
import { ComposerNode } from '../../../../src/stores/useComposerStore';

const goHome = () => startTransition(() => router.replace('/entry'));

export default function ComposerNodeScreen() {
    /* ─── Route params ───────────────────────────────────── */
    const { treeId, nodeId } =
        useLocalSearchParams<{ treeId: string; nodeId: string }>();

    const colors = useColors();

    /* ─── Editing helpers (create child, save, etc.) ─────── */
    const {
        nodePath,
        updateNode,
        insertChildNode,
        saveTree,
        loadTree,
    } = useComposerEditingState(treeId, nodeId);

    /* ─── Global state ───────────────────────────────────── */
    const composerTree = useComposerStore((s) => s.composerTree);

    /* ─── UI state ───────────────────────────────────────── */
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [saveTitle, setSaveTitle] = useState('');
    const [saving, setSaving] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false);

    const loadedOnce = useRef(false);

    /* ─── Initial tree load (skip if already cached) ─────── */
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

    /* ─── Spinner guard: wait for tree + node ─────────────── */
    if (
        !composerTree ||                     // tree not yet in Zustand
        (nodeId && !composerTree.nodes[nodeId]) // node not present yet
    ) {
        return (
            <ThemedSafeArea>
                <ActivityIndicator size="large" color={colors.primary} />
            </ThemedSafeArea>
        );
    }

    /* By this point, currentNode is definitely defined */
    const node = composerTree.nodes[nodeId!] as ComposerNode;

    /* ─── Save helpers ───────────────────────────────────── */
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

    /* ─── Render ─────────────────────────────────────────── */
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
