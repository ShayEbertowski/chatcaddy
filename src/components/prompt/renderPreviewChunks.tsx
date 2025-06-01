import { View, TouchableOpacity, Text } from "react-native";
import { useColors } from "../../hooks/useColors";
import { getSharedStyles } from "../../styles/shared";

type RenderPreviewChunksProps = {
    content: string;
    onChipPress?: (variableName: string) => void;
};

export function RenderPreviewChunks({ content, onChipPress }: RenderPreviewChunksProps) {
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
                        <TouchableOpacity
                            key={index}
                            style={sharedStyles.chip}
                            onPress={() => onChipPress?.(variableName)}
                        >
                            <Text style={sharedStyles.chipText}>{variableName}</Text>
                        </TouchableOpacity>
                    );
                } else {
                    return (
                        <Text key={index} style={{ color: colors.onPrimary }}>
                            {part}
                        </Text>
                    );
                }
            })}
        </View>
    );
}
