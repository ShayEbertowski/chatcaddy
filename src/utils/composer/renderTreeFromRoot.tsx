import React, { JSX } from 'react';
import { View, Text } from 'react-native';
import { ComposerNode } from '../../stores/useComposerStore';
import { Variable } from '../../types/prompt';

type Props = {
    rootId: string;
    nodes: Record<string, ComposerNode>;
    currentNodeId: string;
    colors: any;
    onPressNode: (id: string) => void;
    collapsedNodes: Set<string>;
    toggleCollapse: (id: string) => void;
};

export function renderTreeFromRoot({
    rootId,
    nodes,
    currentNodeId,
    colors,
    onPressNode,
    collapsedNodes,
    toggleCollapse,
}: Props): JSX.Element[] {
    const visited = new Set<string>();
    const INDENT_SPACING = '        ';

    const handlePress = (id: string) => {
        setTimeout(() => onPressNode(id), 0);
    };

    const render = (id: string, level: number): JSX.Element[] => {
        if (visited.has(id)) return [];
        visited.add(id);

        const node = nodes[id];
        if (!node) return [];

        const contentVariables = Array.from(
            node.content.matchAll(/{{(.*?)}}/g),
            (match) => match[1].trim()
        );

        const variablePromptIds = contentVariables.map((varName) => {
            const variable = (node.variables as Record<string, Variable> | undefined)?.[varName];
            if (variable?.type === 'prompt') {
                return variable.promptId ?? `__missing_prompt__:${varName}:${node.id}`;
            }
            return `__missing_prompt__:${varName}:${node.id}`;
        });

        const allChildIds = [...(node.childIds || []), ...variablePromptIds];
        const hasChildren = allChildIds.length > 0;
        const isCollapsed = collapsedNodes.has(id);

        const indent = INDENT_SPACING.repeat(Math.max(0, level - 1));
        const arrow = level > 0 ? '└─ ' : '';

        const nodeItem = (
            <View key={id} style={{ marginBottom: 6, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: colors.mutedText }}>
                    {indent + arrow}
                </Text>

                {hasChildren && (
                    <Text
                        onPress={() => toggleCollapse(id)}
                        style={{
                            marginRight: 4,
                            color: colors.secondaryText,
                        }}
                    >
                        {isCollapsed ? '➕' : '➖'}
                    </Text>
                )}

                <Text
                    onPress={() => handlePress(id)}
                    style={{
                        padding: 6,
                        borderRadius: 6,
                        borderColor: id.startsWith('__missing_prompt__') ? colors.warning : colors.accentSoft,
                        borderWidth: 1,
                        backgroundColor: id === currentNodeId ? colors.accentSoft : colors.surface,
                        color: id.startsWith('__missing_prompt__')
                            ? colors.warning
                            : id === currentNodeId
                                ? colors.onAccent
                                : colors.text,
                    }}
                >
                    {id.startsWith('__missing_prompt__')
                        ? `⚠️ ${id.split(':')[1]}`
                        : node.title || previewContent(node.content) || 'Untitled'}
                </Text>
            </View>
        );

        if (isCollapsed) return [nodeItem];

        const childElements = allChildIds.flatMap((childId) => {
            if (childId.startsWith('__missing_prompt__')) {
                const [, varName] = childId.split(':');
                return (
                    <View key={childId} style={{ marginBottom: 6, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: colors.mutedText }}>
                            {INDENT_SPACING.repeat(level) + '└─ '}
                        </Text>
                        <Text
                            onPress={() => handlePress(childId)}
                            style={{
                                padding: 6,
                                borderRadius: 6,
                                borderColor: colors.warning,
                                borderWidth: 1,
                                backgroundColor: colors.surface,
                                color: colors.warning,
                            }}
                        >
                            ⚠️ {varName}
                        </Text>
                    </View>
                );
            }

            if (!nodes[childId]) {
                console.warn('⚠️ Skipping missing node:', childId);
                return [];
            }

            return render(childId, level + 1);
        });

        return [nodeItem, ...childElements];
    };

    return render(rootId, 0);
}

function previewContent(content: string): string {
    return content.length > 40 ? content.slice(0, 40) + '…' : content;
}
