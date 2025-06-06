import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { ComposerNode } from '../../types/composer';
import { useColors } from '../../hooks/useColors';

interface Props {
    node: ComposerNode;
}

export function SwipeNodeView({ node }: Props) {
    const router = useRouter();
    const colors = useColors();
    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{node.title}</Text>
            <Text style={styles.content}>{node.content}</Text>

            {Object.entries(node.variables).map(([varName, val]) => {
                if (val.type === 'entity') {
                    return (
                        <Button
                            key={varName}
                            title={`→ ${val.entity.title}`}
                            onPress={() => router.push(`/playground/swipe/${val.entity.id}`)}
                        />
                    );
                }
                return (
                    <Text key={varName}>{varName}: {val.value}</Text>
                );
            })}
        </View>
    );
}


const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
        title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: colors.text },
        content: { fontSize: 16, marginBottom: 16, color: colors.text },
    });
