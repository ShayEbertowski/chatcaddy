import React, { useRef } from 'react';
import { View, Text, StyleSheet, Button, PanResponder, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { ComposerNode } from '../../core/types/composer';
import { useColors } from '../../hooks/useColors';

interface Props {
    node: ComposerNode;
}

export function SwipeNodeView({ node }: Props) {
    const router = useRouter();
    const pan = useRef(new Animated.ValueXY()).current;
    const colors = useColors();

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
            return Math.abs(gestureState.dx) > 20; // only respond to horizontal swipes
        },
        onPanResponderRelease: (_, gesture) => {
            if (gesture.dx < -50) {
                // Swipe Left → go deeper
                const child = Object.values(node.variables).find(
                    (val) => val.type === 'entity'
                );
                if (child && child.type === 'entity') {
                    router.push(`/playground/swipe/${child.entity.id}`);
                }
            } else if (gesture.dx > 50) {
                // Swipe Right → go back
                router.back();
            }
        }
    });

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[styles.container]}
        >
            <Text style={styles.title}>{node.title}</Text>
            <Text style={styles.content}>{node.content}</Text>

            {Object.entries(node.variables).map(([varName, val]) => {
                if (val.type === 'entity') {
                    return (
                        <Text key={varName} style={styles.childHint}>
                            Swipe Left to enter child: {val.entity.title}
                        </Text>
                    );
                }
                return (
                    <Text key={varName} style={{ color: colors.text }}>
                        {varName}: {val.value}
                    </Text>
                );
            })}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
    content: { fontSize: 16, marginBottom: 16 },
    childHint: { fontSize: 14, color: '#999', marginBottom: 8 },
});
