// app/(drawer)/(composer)/[treeId]/[nodeId].tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Snackbar } from 'react-native-paper';


import { ThemedSafeArea } from '../../../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../../../src/components/ui/ThemedButton';
import { useColors } from '../../../../src/hooks/useColors';
import { useComposerEditingState } from '../../../../src/stores/useComposerEditingState';
import { ComposerEditorView } from '../../../../src/components/composer/ComposerEditorView';
import { useComposerStore } from '../../../../src/stores/useComposerStore';
import SavePromptModal from '../../../../src/components/modals/SavePromptModal';
import { generateSmartTitle } from '../../../../src/utils/prompt/generateSmartTitle';

export default function ComposerNodeScreen() {
    const { treeId, nodeId } = useLocalSearchParams<{ treeId: string; nodeId: string }>();
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

    const [snackbarVisible, setSnackbarVisible] = useState(false);


    const hasLoadedRef = useRef(false);
    useEffect(() => {
        if (!treeId || hasLoadedRef.current) return;
        hasLoadedRef.current = true;
        loadTree(treeId).catch(console.error);
    }, [treeId]);

    const loading = !currentNode;

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
            setSnackbarVisible(true);
            setTimeout(() => {
                setSnackbarVisible(false);
                console.log('Routing to /new');
                router.replace('/new');
            }, 1200); // enough time to notice before navigating
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
        useEffect(() => {
            router.replace('/new');
        }, []);
        return null;
    }

    return (
        <ThemedSafeArea>
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
                <ComposerEditorView
                    treeId={treeId}
                    currentNode={currentNode}
                    nodePath={nodePath}
                    onChangeNode={(patch) => updateNode(patch)}
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
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={1500}
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
