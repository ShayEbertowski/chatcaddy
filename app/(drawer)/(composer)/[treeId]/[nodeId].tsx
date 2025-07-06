import React, { useEffect, useRef, useState } from 'react';
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
import { renderTreeFromRoot } from '../../../../src/utils/composer/renderTreeFromRoot';

const goHome = () => router.replace('/entry');

export default function ComposerNodeScreen() {
    const rawParams = useLocalSearchParams();
    const treeId = String(rawParams.treeId || '');
    const nodeId = String(rawParams.nodeId || '');
    const rawPath = rawParams.path;

    const initialPathIds = Array.isArray(rawPath)
        ? JSON.parse(rawPath[0])
        : rawPath
            ? JSON.parse(rawPath)
            : undefined;

    if (!treeId || !nodeId) {
        return (
            <ThemedSafeArea>
                <Text style={{ color: 'red', padding: 20 }}>
                    ⚠️ Missing treeId or nodeId in route parameters.
                </Text>
            </ThemedSafeArea>
        );
    }

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
    const [safeNode, setSafeNode] = useState<ComposerNode | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [saveTitle, setSaveTitle] = useState('');
    const [saving, setSaving] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false);
    const [queuedSave, setQueuedSave] = useState(false);
    const [showMiniMap, setShowMiniMap] = useState(false);
    const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

    const loadedOnce = useRef(false);

    console.log('🎯 current node', nodeId, composerTree?.nodes?.[nodeId]);

    // Load the tree if not already
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

    // Wait for safeNode to be available
    useEffect(() => {
        if (!nodeId) return;
        const maybe = useComposerStore.getState().composerTree?.nodes?.[nodeId];
        if (maybe) {
            setSafeNode(maybe);
            return;
        }

        const interval = setInterval(() => {
            const maybe = useComposerStore.getState().composerTree?.nodes?.[nodeId];
            if (maybe) {
                setSafeNode(maybe);
                clearInterval(interval);
            }
        }, 30);

        return () => clearInterval(interval);
    }, [nodeId]);

    const isAtRoot = safeNode?.id === composerTree?.rootId;

    const handleSaveTreeRequest = () => {
        if (isAtRoot) {
            openSaveModal();
        } else {
            setQueuedSave(true);
            router.push(`/(drawer)/(composer)/${treeId}/${composerTree?.rootId}`);
        }
    };

    useEffect(() => {
        if (queuedSave && isAtRoot) {
            setQueuedSave(false);
            openSaveModal();
        }
    }, [queuedSave, isAtRoot]);

    const openSaveModal = async () => {
        if (!safeNode?.content.trim()) return;

        setIsGeneratingTitle(true);
        try {
            const smart = await generateSmartTitle(safeNode.content);
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

    const toggleCollapse = (id: string) => {
        setCollapsedNodes(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    if (!composerTree || !safeNode) {
        return (
            <ThemedSafeArea>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ textAlign: 'center', marginTop: 10 }}>Loading node...</Text>
            </ThemedSafeArea>
        );
    }

    return (
        <ThemedSafeArea>
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
                <View style={{ alignItems: 'flex-end', padding: 8 }}>
                    <Text
                        style={{ color: colors.accentSoft, fontSize: 16 }}
                        onPress={() => setShowMiniMap(true)}
                    >
                        🗺 Zoom Out
                    </Text>
                </View>

                <ComposerEditorView
                    treeId={treeId}
                    currentNode={safeNode}
                    nodePath={nodePath}
                    onChangeNode={updateNode}
                    onChipPress={insertChildNode}
                    onSaveTree={handleSaveTreeRequest}
                />
            </View>

            <SavePromptModal
                visible={showSaveModal}
                title={saveTitle}
                prompt={safeNode.content}
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

            {showMiniMap && (
                <View
                    style={{
                        position: 'absolute',
                        top: 60,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: colors.background,
                        padding: 16,
                        zIndex: 10,
                    }}
                >
                    <View style={{ marginTop: 12 }}>
                        {renderTreeFromRoot({
                            rootId: composerTree.rootId,
                            nodes: composerTree.nodes,
                            currentNodeId: safeNode.id,
                            colors,
                            onPressNode: async (id) => {
                                if (id.startsWith('__missing_prompt__')) {
                                    const [, varName, parentId] = id.split(':');
                                    await insertChildNode(varName, parentId);
                                }
                                router.push(`/(drawer)/(composer)/${treeId}/${id}`);
                                setShowMiniMap(false);
                            },
                            collapsedNodes,
                            toggleCollapse,
                        })}
                    </View>
                </View>
            )}
        </ThemedSafeArea>
    );
}
