// src/components/composer/ComposerRunner.tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useComposerStore } from '../../stores/useComposerStore';
import { useVariableStore } from '../../stores/useVariableStore';
import { useColors } from '../../hooks/useColors';
import { inferVariablesFromRoot } from '../../utils/composer/inferVariables';
import { Variable } from '../../types/prompt';

interface ComposerRunnerProps {
    treeId: string;
    nodeId: string;
    readOnly?: boolean;
    allowVariableInput?: boolean;
    onVariablesChange?: (flatVars: Record<string, string>) => void;
}

export const ComposerRunner: React.FC<ComposerRunnerProps> = ({
    treeId,
    nodeId,
}) => {
    const colors = useColors();
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const setAllVariables = useVariableStore((s) => s.setVariables);
    const variables = useVariableStore((s) => s.values);
    const [contentParts, setContentParts] = useState<string[]>([]);

    useEffect(() => {
        try {
            const store = useComposerStore.getState();
            store.loadTree(treeId);

            const tree = store.composerTree;
            if (!tree) return;

            const inferred = inferVariablesFromRoot(tree);

            // TEMP: Assign test values
            inferred['topic'] = {
                type: 'string',
                value: 'AI-generated summaries',
                richCapable: false,
            };
            inferred['tone'] = {
                type: 'string',
                value: 'a friendly tone',
                richCapable: false,
            };

            setAllVariables(inferred);

            const node = tree.nodes?.[nodeId];
            if (!node) {
                setStatus('error');
                return;
            }

            const parts = node.content.split(/(\{\{.*?\}\})/g) ?? [];
            setContentParts(parts);

            setStatus('ready');
        } catch (err) {
            setStatus('error');
        }
    }, [treeId, nodeId]);

    if (status === 'loading') {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: colors.background,
                }}
            >
                <Text style={{ color: colors.text }}>Loading...</Text>
            </View>
        );
    }

    if (status === 'error') {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: colors.background,
                }}
            >
                <Text style={{ color: colors.error }}>Error loading prompt.</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
            <Text style={{ color: colors.text, fontSize: 16, marginBottom: 12 }}>
                Preview:
            </Text>
            <Text style={{ color: colors.text, fontSize: 16 }}>
                {contentParts.map((part, i) => {
                    const match = part.match(/\{\{(.*?)\}\}/);
                    if (match) {
                        const varName = match[1];
                        const val = variables?.[varName];
                        return val?.type === 'string' ? val.value : `[${varName}]`;
                    }
                    return part;
                })}
            </Text>
        </View>
    );
};
