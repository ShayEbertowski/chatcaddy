import React, { useEffect, useRef, useState, useCallback } from 'react';
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

const goHome = () => router.replace('/entry');

export default function ComposerNodeScreen() {
    const rawParams = useLocalSearchParams();
    const treeId = String(rawParams.treeId);
    const nodeId = String(rawParams.nodeId);
    const rawPath = rawParams.path;

    const initialPathIds = Array.isArray(rawPath)
        ? JSON.parse(rawPath[0])
        : rawPath
        ? JSON.parse(rawPath)
        : undefined;

    const screenKey = `${treeId}-${nodeId}`;

    return (
        <ComposerNodeScreenInner
            key={screenKey}
            treeId={treeId}
            nodeId={nodeId}
            initialPathIds={initialPathIds}
        />
    );
}

function ComposerNodeScreenInner({
    treeId,
    nodeId,
    initialPathIds,
}: {
    treeId: string;
    nodeId: string;
    initialPathIds?: string[];
}) {
    const colors = useColors();

    const {
        nodePath,
        updateNode,
        insertChildNode,
        saveTree,
        loadTree,
    } = useComposerEditingState(treeId, nodeId, { initialPathIds });

    const composerTree = useComposerStore((s) => s.composerTree);
    console.log("🥶 composer tree", composerTree)

    const [showSaveModal, setShowSaveModal] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [saveTitle, setSaveTitle] = useState('');
    const [saving, setSaving] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false);
    const [queuedSave, setQueuedSave] = useState(false);

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

    const node = composerTree?.nodes?.[nodeId];

    const isAtRoot = node?.id === composerTree?.rootId;

    // When Save is triggered from a child node, redirect to root and queue save
    const handleSaveTreeRequest = () => {
        if (isAtRoot) {
            openSaveModal();
        } else {
            setQueuedSave(true);
            router.push(`/(drawer)/(composer)/${treeId}/${composerTree?.rootId}`);
        }
    };

    // After navigating to root, detect and open modal
    useEffect(() => {
        if (queuedSave && isAtRoot) {
            setQueuedSave(false);
            openSaveModal();
        }
    }, [queuedSave, isAtRoot]);

    const openSaveModal = async () => {
        if (!node?.content.trim()) return;

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

    if (!composerTree) {
        return (
            <ThemedSafeArea>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ textAlign: 'center', marginTop: 10 }}>Loading tree...</Text>
            </ThemedSafeArea>
        );
    }

    if (!node) {
        return (
            <ThemedSafeArea>
                <Text style={{ padding: 20, color: colors.error }}>
                    ⚠️ Node not found in this tree.
                </Text>
            </ThemedSafeArea>
        );
    }

    return (
        <ThemedSafeArea>
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
                <ComposerEditorView
                    treeId={treeId}
                    currentNode={node}
                    nodePath={nodePath}
                    onChangeNode={updateNode}
                    onChipPress={insertChildNode}
                    onSaveTree={handleSaveTreeRequest}
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
