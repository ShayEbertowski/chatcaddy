import React from 'react';
import { View, Text, Alert } from 'react-native';
import { ComposerNode } from '../../core/types/composer';
import PromptPathNavigator from './PromptPathNavigator';
import RichPromptEditor from '../editor/RichPromptEditor';
import { ThemedButton } from '../ui/ThemedButton';
import { toEditorVariables, fromEditorVariables } from '../../utils/composer/variables';

type ComposerEditorViewProps = {
    treeId: string;
    currentNode: ComposerNode;
    nodePath: ComposerNode[];
    readOnly?: boolean;
    onChangeNode: (updates: Partial<ComposerNode>) => void;
    onChipPress: (chipText: string) => void;
};

export function ComposerEditorView({
    treeId,
    currentNode,
    nodePath,
    readOnly,
    onChangeNode,
    onChipPress,
}: ComposerEditorViewProps) {
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
                {currentNode.title || '(Untitled Node)'}
            </Text>

            <RichPromptEditor
                text={currentNode.content}
                onChangeText={(text) => onChangeNode({ content: text })}
                entityType={currentNode.entityType}
                onChangeEntityType={(entityType) => onChangeNode({ entityType })}
                variables={toEditorVariables(currentNode.variables)}
                onChangeVariables={(vars) =>
                    onChangeNode({ variables: fromEditorVariables(vars) })
                }
                onChipPress={onChipPress}
                readOnly={readOnly}
            />

            {!readOnly && (
                <ThemedButton
                    title="Save Tree"
                    onPress={() => Alert.alert('Not wired yet', 'Connect this to saveTree()')}
                    style={{ marginTop: 24 }}
                />
            )}
        </View>
    );
}
