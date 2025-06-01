import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { getSharedStyles } from '../../styles/shared';

type RenderPreviewChunksProps = {
    content: string;
};

export function RenderPreviewChunks({ content }: RenderPreviewChunksProps) {
    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);

    const parts = content.split(/({{.*?}})/g);

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
            {parts.map((part, index) => {
                const match = part.match(/{{(.*?)}}/);
                if (match) {
                    const variableName = match[1].split('=')[0].trim();
                    return (
                        <View key={index} style={sharedStyles.chip}>
                            <Text style={sharedStyles.chipText}>{variableName}</Text>
                        </View>
                    );
                } else {
                    return (
                        <Text key={index} style={{ color: colors.text }}>
                            {part}
                        </Text>
                    );
                }
            })}
        </View>
    );
}
