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
        const isActive = id === currentNodeId;

        const indent = INDENT_SPACING.repeat(Math.max(0, level - 1));
        const arrow = level > 0 ? '└─ ' : '';

        const nodeItem = (
            <View
                key={id}
                style={{
                    marginBottom: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <Text style={{ color: colors.mutedText }}>
                    {indent + arrow}
                </Text>

                {hasChildren && (
                    <Text
                        onPress={() => toggleCollapse(id)}
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: colors.accentSoft,
                            color: colors.onAccent,
                            textAlign: 'center',
                            lineHeight: 24,
                            marginRight: 6,
                            fontWeight: 'bold',
                        }}
                    >
                        {isCollapsed ? '+' : '–'}
                    </Text>
                )}

                <View
                    style={{
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        paddingLeft: isActive ? 14 : 10,
                        backgroundColor: id.startsWith('__missing_prompt__')
                            ? colors.surface
                            : isActive
                                ? colors.primarySoft
                                : colors.accent + '33',
                        borderRadius: 6,
                        borderColor: id.startsWith('__missing_prompt__')
                            ? colors.warning
                            : isActive
                                ? colors.primary
                                : colors.accent,
                        borderWidth: 1,
                        borderLeftWidth: isActive ? 4 : 1,
                        borderLeftColor: id.startsWith('__missing_prompt__')
                            ? colors.warning
                            : isActive
                                ? colors.primary
                                : colors.accent,
                        minHeight: 36,
                        justifyContent: 'center',
                    }}
                >
                    <Text
                        onPress={() => handlePress(id)}
                        style={{
                            color: id.startsWith('__missing_prompt__')
                                ? colors.warning
                                : colors.onSurface,
                            fontSize: 13,
                            fontWeight: '500',
                            letterSpacing: 0.3,
                        }}
                    >
                        {id.startsWith('__missing_prompt__')
                            ? `⚠️ ${id.split(':')[1]}`
                            : node.title || previewContent(node.content) || 'Untitled'}
                    </Text>
                </View>
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
