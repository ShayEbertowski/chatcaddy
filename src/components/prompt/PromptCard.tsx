import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getSharedStyles } from '../../styles/shared';
import { useColors } from '../../hooks/useColors';

type PromptCardProps = {
    title: string;
    content: string;
    onPress: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function PromptCard({
    title,
    content,
    onPress,
    onEdit,
    onDelete,
}: PromptCardProps) {
    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);
    const styles = getStyles(colors);

    const renderPreviewChunks = (raw: string) => {
        const parts = raw.split(/({{.*?}})/g);

        return parts.map((part, index) => {
            const match = part.match(/{{(.*?)}}/);
            if (match) {
                const variableName = match[1].split('=')[0].trim();
                return (
                    <View key={index} style={sharedStyles.chip}>
                        <Text style={sharedStyles.chipText}>{variableName}</Text>
                    </View>
                );
            }

            return (
                <Text key={index} style={styles.previewText}>
                    {part}
                </Text>
            );
        });
    };

    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                    {title}
                </Text>
                <View style={styles.previewRow}>{renderPreviewChunks(content)}</View>
            </TouchableOpacity>

            <View style={styles.actions}>
                <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
                    <MaterialIcons name="edit" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
                    <MaterialIcons name="delete" size={20} color={colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        card: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 18,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 7,
        },
        title: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 6,
        },
        previewRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: 12,
        },
        previewText: {
            fontSize: 14,
            color: colors.text,
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 16,
        },
        iconButton: {
            paddingHorizontal: 6,
            paddingVertical: 4,
            borderRadius: 6,
            backgroundColor: colors.inputBackground, // optional: makes icon area visible
        },
    });
