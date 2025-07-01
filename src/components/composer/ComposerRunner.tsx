import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from 'react-native';

import { useComposerStore } from '../../stores/useComposerStore';
import { useVariableStore } from '../../stores/useVariableStore';
import { useColors } from '../../hooks/useColors';
import { inferVariablesFromRoot } from '../../utils/composer/inferVariables';
import { getSharedStyles } from '../../styles/shared';
import { StringVariable, Variable } from '../../types/prompt';

interface ComposerRunnerProps {
    treeId: string;
    nodeId: string;
    readOnly?: boolean;
    allowVariableInput?: boolean;
    onVariablesChange?: (flatVars: Record<string, string>) => void;
    onChipPress?: (name: string) => void;
}

function isStringVariable(v: Variable | undefined): v is StringVariable {
    return !!v && v.type === 'string' && 'value' in v && 'richCapable' in v;
}

export const ComposerRunner: React.FC<ComposerRunnerProps> = ({
    treeId,
    nodeId,
    onVariablesChange,
    onChipPress,
}) => {
    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);
    const composerTree = useComposerStore((s) => s.composerTree);
    const [contentParts, setContentParts] = useState<string[] | null>(null);

    const node = useMemo(() => composerTree?.nodes?.[nodeId], [composerTree, nodeId]);

    useEffect(() => {
        useComposerStore.getState().loadTree(treeId);
    }, [treeId]);

    useEffect(() => {
        if (!composerTree || !node) return;

        const cleared = Object.fromEntries(
            Object.entries(inferVariablesFromRoot(composerTree)).map(([k, v]) => [
                k,
                v.type === 'string' ? { ...v, value: '' } : v,
            ])
        );
        useVariableStore.getState().setVariables(cleared);

        if (onVariablesChange) {
            const flatVars: Record<string, string> = {};
            for (const [k, v] of Object.entries(cleared)) {
                if (isStringVariable(v)) flatVars[k] = v.value;
            }
            onVariablesChange(flatVars);
        }

        const parts = node.content.split(/(\{\{.*?\}\})/g);
        setContentParts(parts);
    }, [composerTree, node]);

    if (!composerTree || !node || !contentParts) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <Text style={{ color: colors.text }}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                {contentParts.map((part, i) => {
                    const match = part.match(/\{\{(.*?)\}\}/);
                    if (match) {
                        const varName = match[1];
                        const variable = useVariableStore.getState().values[varName];
                        const value = isStringVariable(variable) ? variable.value.trim() : '';

                        return (
                            <View key={`chip-${i}`} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8, marginBottom: 4 }}>
                                <TouchableOpacity
                                    onPress={() => onChipPress?.(varName)}
                                    style={sharedStyles.chip}
                                >
                                    <Text style={sharedStyles.chipText}>{varName}</Text>
                                </TouchableOpacity>
                                <Text style={{
                                    fontSize: 12,
                                    marginLeft: 4,
                                    color: value ? colors.onAccent : colors.placeholder,
                                }}>
                                    {value || '[Not Set]'}
                                </Text>
                            </View>
                        );
                    }

                    return (
                        <Text
                            key={`text-${i}`}
                            style={{
                                color: colors.text,
                                fontSize: 16,
                                lineHeight: 24,
                                marginRight: 4,
                            }}
                        >
                            {part}
                        </Text>
                    );
                })}
            </View>
        </ScrollView>
    );
};
