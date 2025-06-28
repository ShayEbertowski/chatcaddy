import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useComposerStore } from '../../stores/useComposerStore';
import { useVariableStore } from '../../stores/useVariableStore';
import RichPromptEditor from '../editor/RichPromptEditor';
import { inferVariablesFromRoot } from '../../utils/composer/inferVariables';
import { Variable } from '../../types/prompt';

interface ComposerRunnerProps {
    treeId: string;
    nodeId: string;
    readOnly?: boolean;
    allowVariableInput?: boolean;
}

export const ComposerRunner: React.FC<ComposerRunnerProps> = ({
    treeId,
    nodeId,
    readOnly = true,
    allowVariableInput = true,
}) => {
    const loadTree = useComposerStore.getState().loadTree;
    const composerTree = useComposerStore((s) => s.composerTree);
    const setAllVariables = useVariableStore((s) => s.setVariables);

    useEffect(() => {
        const load = async () => {
            console.log('Loading tree:', treeId);
            await loadTree(treeId);
            const tree = useComposerStore.getState().composerTree;
            console.log('Loaded composerTree:', tree);
            console.log('Expected nodeId:', nodeId);
            if (tree) {
                const node = tree.nodes?.[nodeId];
                console.log('Selected node:', node);
                const inferred = inferVariablesFromRoot(tree);
                setAllVariables(inferred);
            }
        };
        load();
    }, [treeId, nodeId]);


    if (!composerTree || !composerTree.nodes[nodeId]) {
        console.warn('⚠️ Node not found:', nodeId);
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'red' }}>⚠️ Node not found: {nodeId}</Text>
            </View>
        );
    }


    const node = composerTree.nodes?.[nodeId];
    if (!node) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'red' }}>⚠️ Node not found: {nodeId}</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <RichPromptEditor
                text={node.content}
                onChangeText={() => { }}
                entityType={node.entityType}
                onChangeEntityType={() => { }}
                variables={node.variables as Record<string, Variable>}
                onChangeVariables={() => { }}
                onChipPress={() => { }}
                readOnly={readOnly}
                readOnlyContent={readOnly}
                readOnlyVariables={!allowVariableInput}
            />
        </View>
    );
};
