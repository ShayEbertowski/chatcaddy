import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useComposerStore } from '../../stores/useComposerStore';
import { useVariableStore } from '../../stores/useVariableStore';
import RichPromptEditor from '../editor/RichPromptEditor';
import { inferVariablesFromRoot } from '../../utils/composer/inferVariables';

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
            await loadTree(treeId);
            const tree = useComposerStore.getState().composerTree;
            if (tree) {
                const inferred = inferVariablesFromRoot(tree);
                setAllVariables(inferred);
            }
        };
        load();
    }, [treeId, nodeId]);

    return (
        <View style={{ flex: 1 }}>
            <RichPromptEditor
                readOnly={readOnly}
                allowVariableInput={allowVariableInput}
            />
        </View>
    );
};
