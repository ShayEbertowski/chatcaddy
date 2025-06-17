import React from 'react';
import { View, Text } from 'react-native';
import PromptPathNavigator from './PromptPathNavigator';
import RichPromptEditor from '../editor/RichPromptEditor';
import { ThemedButton } from '../ui/ThemedButton';
import { toEditorVariables, fromEditorVariables } from '../../utils/composer/variables';
import { ComposerNode } from '../../stores/useComposerStore';

type ComposerEditorViewProps = {
    treeId: string;
    currentNode: ComposerNode;
    nodePath: ComposerNode[];
    readOnly?: boolean;
    onChangeNode: (updates: Partial<ComposerNode>) => void;
    onChipPress: (chipText: string) => void;
    onSaveTree?: () => void;
};

export function ComposerEditorView({
    treeId,
    currentNode,
    nodePath,
    readOnly = false,
    onChangeNode,
    onChipPress,
    onSaveTree,
}: ComposerEditorViewProps) {
    console.log('🎯 ComposerEditorView mounted');
    console.log('TreeId:', treeId);
    console.log('Node:', currentNode);
    console.log('Content:', currentNode.content);
    console.log('ReadOnly:', readOnly);

    const allowedTypes = ['Prompt', 'Function', 'Snippet'] as const;
    const fallbackType = allowedTypes.includes(currentNode.entityType as any)
        ? (currentNode.entityType as typeof allowedTypes[number])
        : 'Prompt';

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <PromptPathNavigator
                treeId={treeId}
                nodePath={nodePath}
                currentNode={currentNode}
                readOnly={readOnly}
                scrollIntoLast={true}
            />

            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: 'white' }}>
                {currentNode.title?.trim() || '(Untitled Node)'}
            </Text>

            <RichPromptEditor
                text={currentNode.content}
                onChangeText={(text) => onChangeNode({ content: text })}
                entityType={fallbackType}
                onChangeEntityType={(entityType) => onChangeNode({ entityType })}
                variables={toEditorVariables(currentNode.variables)}
                onChangeVariables={(vars) =>
                    onChangeNode({ variables: fromEditorVariables(vars) })
                }
                onChipPress={onChipPress}
                readOnly={readOnly}
            />

            {!readOnly && onSaveTree && (
                <ThemedButton title="Save Tree" onPress={onSaveTree} style={{ marginTop: 24 }} />
            )}
        </View>
    );
}
