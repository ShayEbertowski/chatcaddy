import React from 'react';
import { View, Text } from 'react-native';
import PromptPathNavigator from './PromptPathNavigator';
import RichPromptEditor from '../editor/RichPromptEditor';
import { ThemedButton } from '../ui/ThemedButton';
import { toEditorVariables, fromEditorVariables } from '../../utils/composer/variables';
import { ComposerNode } from '../../types/composer';

type ComposerEditorViewProps = {
    treeId: string;
    currentNode: ComposerNode;
    nodePath: ComposerNode[];
    readOnly?: boolean;
    onChangeNode: (updates: Partial<ComposerNode>) => void;
    onChipPress: (chipText: string) => void;
    onSaveTree?: () => void; // ✅ optional save handler
};

export function ComposerEditorView({
    treeId,
    currentNode,
    nodePath,
    readOnly,
    onChangeNode,
    onChipPress,
    onSaveTree,
}: ComposerEditorViewProps) {

    const allowedTypes = ['Prompt', 'Function', 'Snippet'] as const;
    const fallbackType: 'Prompt' | 'Function' | 'Snippet' =
        allowedTypes.includes(currentNode.entityType as any)
            ? (currentNode.entityType as any)
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
                <ThemedButton
                    title="Save Tree"
                    onPress={onSaveTree}
                    style={{ marginTop: 24 }}
                />
            )}
        </View>
    );
}
