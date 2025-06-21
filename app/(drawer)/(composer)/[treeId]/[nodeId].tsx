import React, { useEffect, useRef, useState, startTransition } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Snackbar } from 'react-native-paper';

import { ThemedSafeArea } from '../../../../src/components/shared/ThemedSafeArea';
import { useColors } from '../../../../src/hooks/useColors';
import { useComposerEditingState } from '../../../../src/stores/useComposerEditingState';
import { ComposerEditorView } from '../../../../src/components/composer/ComposerEditorView';
import SavePromptModal from '../../../../src/components/modals/SavePromptModal';
import { generateSmartTitle } from '../../../../src/utils/prompt/generateSmartTitle';

function navigateToComposerIndex() {
    startTransition(() => {
        router.replace('/entry');
    });
}

export default function ComposerNodeScreen() {
    const { treeId, nodeId } = useLocalSearchParams<{ treeId: string; nodeId: string }>();
    const colors = useColors();

    const {
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
    const [snackOpen, setSnackOpen] = useState(false);

    const hasLoadedRef = useRef(false);
    const redirectingRef = useRef(false);

    useEffect(() => {
        if (!treeId || hasLoadedRef.current || redirectingRef.current) return;
        hasLoadedRef.current = true;
        loadTree(treeId).catch(console.error);
    }, [treeId]);

    useEffect(() => {
        if (!currentNode && !redirectingRef.current) {
            redirectingRef.current = true;
            navigateToComposerIndex();
        }
    }, [currentNode]);

    const handleSavePress = async () => {
        if (!currentNode?.content?.trim()) return;
        setIsGeneratingTitle(true);
        try {
            const smart = await generateSmartTitle(currentNode.content);
            setSaveTitle(smart || 'Untitled');
        } catch (err) {
            console.error('❌ Title generation failed', err);
            setSaveTitle('Untitled');
        } finally {
            setIsGeneratingTitle(false);
            setShowSaveModal(true);
        }
    };

    const handleConfirmSave = async () => {
        if (!currentNode) return;
        setSaving(true);
        try {
            updateNode({ title: saveTitle });
            await saveTree();
            setShowSaveModal(false);
            setSnackOpen(true);
        } catch (err) {
            console.error('❌ Save failed', err);
        } finally {
            setSaving(false);
        }
    };

    if (!currentNode) {
        return (
            <ThemedSafeArea>
                <ActivityIndicator size="large" color={colors.primary} />
            </ThemedSafeArea>
        );
    }

    return (
        <ThemedSafeArea>
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
                <ComposerEditorView
                    treeId={treeId}
                    currentNode={currentNode}
                    nodePath={nodePath}
                    onChangeNode={updateNode}
                    onChipPress={insertChildNode}
                    onSaveTree={handleSavePress}
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

            <Snackbar
                visible={snackOpen}
                onDismiss={() => {
                    setSnackOpen(false);
                    redirectingRef.current = true;
                    navigateToComposerIndex();
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
                <Text style={{ color: colors.onSurface }}>
                    Tree saved!
                </Text>
            </Snackbar>
        </ThemedSafeArea>
    );
}
