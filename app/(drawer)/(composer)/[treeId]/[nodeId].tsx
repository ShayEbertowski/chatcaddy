import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { ThemedSafeArea } from '../../../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../../../src/components/ui/ThemedButton';
import { useColors } from '../../../../src/hooks/useColors';
import { getParentNodeId } from '../../../../src/utils/composer/pathUtils';
import { useComposerEditingState } from '../../../../src/stores/useComposerEditingState';
import { ComposerEditorView } from '../../../../src/components/composer/ComposerEditorView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ComposerNodeScreen() {
    const colors = useColors();
    const { treeId, nodeId } = useLocalSearchParams<{ treeId: string; nodeId: string }>();
    const [loading, setLoading] = useState(true);

    const navigation = useNavigation();

    const {
        rootNode,
        currentNode,
        nodePath,
        updateNode,
        insertChildNode,
        saveTree,
        loadTree,
    } = useComposerEditingState(treeId, nodeId);

    useEffect(() => {
        async function loadIfNeeded() {
            if (!rootNode) {
                await loadTree(treeId);
            }
            setLoading(false);
        }
        loadIfNeeded();
    }, [treeId]);

    const parentId = getParentNodeId(nodePath);


    if (loading || !currentNode) {
        return (
            <ThemedSafeArea>
                <ActivityIndicator size="large" color={colors.primary} />
            </ThemedSafeArea>
        );
    }

    return (
        <ThemedSafeArea>

            <View style={{
                flex: 1,
                paddingHorizontal: 16,
            }}>
                {nodePath.length === 1 && (
                    <View
                        style={{
                            padding: 8,
                            marginBottom: 8,
                            borderRadius: 6,
                            backgroundColor: 'rgba(255,255,255,0.05)', // or a soft accent glow
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
                    readOnly={nodePath.length === 1}
                    onChangeNode={updateNode}
                    onChipPress={insertChildNode}
                />

                {/* {parentId && (
                    <ThemedButton
                        title="Back"
                        onPress={() => router.push(`/(drawer)/(composer)/${treeId}/${parentId}`)}
                    />
                )} */}
            </View>
        </ThemedSafeArea>
    );
}
