import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import RichPromptEditor from '../editor/RichPromptEditor';
import { ThemedButton } from '../ui/ThemedButton';
import { NavigationButton } from '../ui/NavigationButton';
import { toEditorVariables, fromEditorVariables } from '../../utils/composer/variables';
import { ComposerNode } from '../../stores/useComposerStore';
import { useComposerStore } from '../../stores/useComposerStore';

type ComposerEditorViewProps = {
    treeId: string;
    currentNode: ComposerNode;
    nodePath: ComposerNode[];
    onChangeNode: (updates: Partial<ComposerNode>) => void;
    onChipPress: (chipText: string) => void;
    onSaveTree?: () => void;
};

function getFlattenedPromptContent(path: ComposerNode[]): string {
    return path.map((node) => node.content.trim()).join(' ');
}

export function ComposerEditorView({
    treeId,
    currentNode,
    nodePath,
    onChangeNode,
    onChipPress,
    onSaveTree,
}: ComposerEditorViewProps) {
    const composerTree = useComposerStore((s) => s.composerTree);
    const isAtRoot = composerTree?.rootId === currentNode.id;

    const allowedTypes = ['Prompt', 'Function', 'Snippet'] as const;
    const fallbackType = allowedTypes.includes(currentNode.entityType as any)
        ? (currentNode.entityType as typeof allowedTypes[number])
        : 'Prompt';

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: 'white' }}>
                        {currentNode.title?.trim() || '(Untitled Node)'}
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 }}>
                        <View style={{ flex: 1 }}>
                            {nodePath.length > 1 && (
                                <NavigationButton
                                    icon="chevron-back"
                                    onPress={() => {
                                        const prev = nodePath.at(-2);
                                        if (prev) router.push(`/(drawer)/(composer)/${treeId}/${prev.id}`);
                                    }}
                                />
                            )}
                        </View>

                        {/* <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            {currentNode.childIds?.length > 0 && (
                                <NavigationButton
                                    icon="chevron-forward"
                                    onPress={() => {
                                        const nextId = currentNode.childIds?.[0];
                                        if (nextId) router.push(`/(drawer)/(composer)/${treeId}/${nextId}`);
                                    }}
                                />
                            )}
                        </View> */}
                    </View>

                    <RichPromptEditor
                        text={currentNode.content}
                        // fullPreviewText={getFlattenedPromptContent(nodePath)}
                        onChangeText={(text) => onChangeNode({ content: text })}
                        entityType={fallbackType}
                        onChangeEntityType={(entityType) => onChangeNode({ entityType })}
                        variables={toEditorVariables(currentNode.variables)}
                        onChangeVariables={(vars) => onChangeNode({ variables: fromEditorVariables(vars) })}
                        onChipPress={onChipPress}
                    />
                </ScrollView>
            </View>

            <View style={{ paddingTop: 12 }}>
                <ThemedButton
                    title={isAtRoot ? 'Save Tree' : 'Go to Root to Save'}
                    onPress={() => {
                        if (isAtRoot) {
                            onSaveTree?.();
                        } else {
                            router.push({
                                pathname: `/(drawer)/(composer)/${treeId}/${composerTree?.rootId}`,
                                params: { autoSave: 'true' },
                            });
                        }
                    }}
                    colorKey={isAtRoot ? 'primary' : 'accent'}
                />
            </View>
        </View>
    );
}
