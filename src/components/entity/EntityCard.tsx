import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { RenderPreviewChunks } from '../prompt/renderPreviewChunks';
import EditOrDeleteActions from '../shared/EditOrDeleteActions';
import { Entity } from '../../types/entity';

type EntityCardProps = {
    entity: Entity;
    onPress: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function EntityCard({ entity, onPress, onEdit, onDelete }: EntityCardProps) {
    const colors = useColors();
    const styles = getStyles(colors);

    const displayTitle = entity.title?.trim() ? entity.title : '(Untitled)';

    // Pull preview content based on entity type:
    const previewText = (entity && entity.content) ?? '';


    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                    {displayTitle}
                </Text>

                <RenderPreviewChunks content={previewText} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <EditOrDeleteActions onEdit={onEdit} onDelete={onDelete} size={20} />
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
    });
