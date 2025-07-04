import React, { JSX, useEffect, useRef, useState } from 'react';
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
import { Variable } from '../../../../src/types/prompt';

const goHome = () => router.replace('/entry');

function previewContent(content: string): string {
    return content.length > 40 ? content.slice(0, 40) + '…' : content;
}

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

    const [showSaveModal, setShowSaveModal] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [saveTitle, setSaveTitle] = useState('');
    const [saving, setSaving] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false);
    const [queuedSave, setQueuedSave] = useState(false);
    const [showMiniMap, setShowMiniMap] = useState(false);

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

    const renderNodeBranch = (
        id: string,
        level: number,
        visited: Set<string>
    ): JSX.Element | null => {
        const node = composerTree?.nodes[id];
        console.log('🔄 Checking node ID:', id, 'Exists:', !!node);

        if (!node || visited.has(id)) return null;
        visited.add(id);

        const variablePromptIds = Object.entries(node.variables as Record<string, Variable>)
            .flatMap(([key, v]) => {
                if (v.type === 'prompt') {
                    if (v.promptId) {
                        return [v.promptId];
                    } else {
                        console.warn(`⚠️ Variable '${key}' in node ${node.id} has no promptId`);
                        return [`__missing_prompt__:${key}:${node.id}`];
                    }
                }
                return [];
            });


        const allChildIds = [...(node.childIds || []), ...variablePromptIds];

        console.log('🧩 Rendering Node:', {
            id,
            title: node.title,
            level,
            childIds: node.childIds,
            variablePromptIds,
            allChildIds,
        });

        return (
            <View key={id} style={{ marginLeft: level * 12, marginBottom: 8 }}>
                <Text
                    onPress={() => {
                        if (!id.startsWith('__missing_prompt__')) {
                            router.push(`/(drawer)/(composer)/${treeId}/${id}`);
                            setShowMiniMap(false);
                        }
                    }}
                    style={{
                        padding: 6,
                        borderRadius: 6,
                        borderColor: id.startsWith('__missing_prompt__') ? colors.warning : colors.accentSoft,
                        borderWidth: 1,
                        backgroundColor: id === nodeId ? colors.accentSoft : colors.surface,
                        color: id.startsWith('__missing_prompt__') ? colors.warning : (id === nodeId ? colors.onAccent : colors.text),
                    }}
                >
                    {id.startsWith('__missing_prompt__')
                        ? `⚠️ Missing variable prompt`
                        : node.title || previewContent(node.content) || 'Untitled'}
                </Text>

                {allChildIds.map((childId) =>
                    renderNodeBranch(childId, level + 1, visited)
                )}
            </View>
        );
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
                    <Text style={{ color: colors.text, marginBottom: 12 }}>🧠 Prompt Tree</Text>
                    <View>
                        {(() => {
                            const visited = new Set<string>();
                            return renderNodeBranch(composerTree.rootId, 0, visited);
                        })()}
                    </View>
                    <Text
                        style={{ marginTop: 16, color: colors.mutedText }}
                        onPress={() => setShowMiniMap(false)}
                    >
                        ✖ Close
                    </Text>
                </View>
            )}

        </ThemedSafeArea>
    );
}
