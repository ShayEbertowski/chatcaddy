import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useVariableStore } from '../stores/useVariableStore';
import { getSharedStyles } from '../styles/shared';
import { useColors } from '../hooks/useColors';


type PromptCardProps = {
    title: string;
    content: string;
    onPress: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onRun: () => void;
};

export default function PromptCard({
    title,
    content,
    onPress,
    onEdit,
    onDelete,
    onRun,
}: PromptCardProps) {
    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);

    const renderPreview = (raw: string): string => {
        return raw.replace(/{{(.*?)}}/g, (_, rawContent) => {
            const [key] = rawContent.split('=');
            const variableName = key.trim();

            const value = useVariableStore.getState().getVariable(variableName);
            return value?.trim() || '?';
        });
    };

    return (
        <View style={styles.card}>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
            >
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                    {title}
                </Text>
                <Text style={sharedStyles.previewVariable} numberOfLines={1} ellipsizeMode="tail">
                    {renderPreview(content)}
                </Text>
            </TouchableOpacity>

            <View style={styles.actions}>
                <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
                    <MaterialIcons name="edit" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
                    <MaterialIcons name="delete" size={20} color="#FF3B30" />
                </TouchableOpacity>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 7, // was 2
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
        marginBottom: 6,
    },
    content: {
        fontSize: 14,
        color: '#555',
        marginBottom: 12,
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
    },


});
