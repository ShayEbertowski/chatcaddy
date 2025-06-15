import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedSafeArea } from '../../../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../../../src/components/ui/ThemedButton';
import { useColors } from '../../../../src/hooks/useColors';
import { getParentNodeId } from '../../../../src/utils/composer/pathUtils';
import { useComposerEditingState } from '../../../../src/stores/useComposerEditingState';
import { ComposerEditorView } from '../../../../src/components/composer/ComposerEditorView';
import { useEntityStore } from '../../../../src/stores/useEntityStore';
import { useComposerStore } from '../../../../src/stores/useComposerStore'; // ✅ NEW
import { supabase } from '../../../../src/lib/supabaseClient';

export default function ComposerNodeScreen() {
    const colors = useColors();
    const { treeId, nodeId } = useLocalSearchParams<{ treeId: string; nodeId: string }>();
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const {
        rootNode,
        currentNode,
        nodePath,
        updateNode,
        insertChildNode,
        saveTree,
        loadTree,
    } = useComposerEditingState(treeId, nodeId);

    const activeTreeId = useComposerStore((s) => s.activeTreeId);
    const isNewTree =
        rootNode?.id === treeId &&
        (!rootNode?.title || rootNode.title.trim() === '') &&
        (!rootNode.children || rootNode.children.length === 0);

    const readOnly = nodePath.length === 1 && !isNewTree;



    useEffect(() => {
        if (currentNode) {
            console.log('✏️ currentNode.content from store:', currentNode.content);
        }
    }, [currentNode?.content]);

    useEffect(() => {
        const load = async () => {
            if (!treeId || typeof treeId !== 'string') return;

            console.log('👽 Attempting to load tree:', treeId);
            try {
                await loadTree(treeId);

                // ✅ This is safe — no hook call here
                const updated = useComposerStore.getState().rootNode;

                if (!updated) {
                    console.warn('⚠️ No tree found with ID:', treeId);
                    setNotFound(true);
                } else {
                    console.log('✅ Successfully loaded tree');
                }
            } catch (err) {
                console.error('❌ Error loading tree:', err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [treeId]);

    const handleSave = async () => {
        try {
            await saveTree(currentNode.title || 'Untitled');
            console.log('✅ Tree saved!');
        } catch (err) {
            console.error('❌ Failed to save tree:', err);
        }
    };



    const parentId = getParentNodeId(nodePath);

    if (loading) {
        return (
            <ThemedSafeArea>
                <ActivityIndicator size="large" color={colors.primary} />
            </ThemedSafeArea>
        );
    }

    if (notFound || !currentNode) {
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
                                const newId = await useComposerStore.getState().createEmptyTree();
                                router.replace(`/(drawer)/(composer)/${newId}/${newId}`);
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

    console.log('🔍 isNewTree:', isNewTree);
    console.log('🧠 activeTreeId:', activeTreeId);
    console.log('🌳 rootNode.id:', rootNode?.id);
    console.log('📛 rootNode.title:', rootNode?.title);
    console.log('📦 nodePath:', nodePath);



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
                    readOnly={nodePath.length === 1 && !isNewTree}
                    onSaveTree={!readOnly ? handleSave : undefined}
                />
            </View>
        </ThemedSafeArea>
    );
}
