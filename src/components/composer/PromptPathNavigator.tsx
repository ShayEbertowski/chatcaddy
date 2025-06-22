import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import Animated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { useColors } from '../../hooks/useColors';
import { router } from 'expo-router';
import { ComposerNode } from '../../stores/useComposerStore';

type Props = {
    treeId: string;
    nodePath: ComposerNode[];
    currentNode: ComposerNode;
    readOnly?: boolean;
    scrollIntoLast?: boolean;
};

export default function PromptPathNavigator({
    treeId,
    nodePath,
    currentNode,
    readOnly,
    scrollIntoLast,
}: Props) {
    const colors = useColors();
    const styles = getStyles(colors);
    const scrollViewRef = useRef<ScrollView>(null);

    // Scroll to end of breadcrumbs when a new one is added
    useEffect(() => {
        if (scrollIntoLast) {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }
    }, [scrollIntoLast]);

    // Animation for last breadcrumb flash
    const flashValue = useSharedValue(0);

    useEffect(() => {
        if (scrollIntoLast) {
            flashValue.value = 1;
            flashValue.value = withTiming(0, { duration: 600 });
        }
    }, [scrollIntoLast]);

    const animatedFlashStyle = useAnimatedStyle(() => ({
        backgroundColor: flashValue.value
            ? 'rgba(255,255,255,0.08)'
            : 'transparent',
        borderRadius: 6,
        paddingHorizontal: 4,
    }));


    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pathRow}
            >
                {nodePath.map((node, i) => {
                    const isLast = i === nodePath.length - 1;

                    return (
                        <View key={node.id} style={styles.pathItem}>
                            <TouchableOpacity
                                disabled={isLast || readOnly}
                                onPress={() =>
                                    router.push(`/(drawer)/(composer)/${treeId}/${node.id}`)
                                }
                            >
                                {isLast ? (
                                    <Animated.View style={animatedFlashStyle}>
                                        <Text style={[styles.pathText, styles.activePath]}>
                                            {node.title || node.id}
                                        </Text>
                                    </Animated.View>
                                ) : (
                                    <Text style={styles.pathText}>
                                        {node.title || node.id}
                                    </Text>
                                )}
                            </TouchableOpacity>
                            {!isLast && <Text style={styles.separator}>›</Text>}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: {
            marginTop: 8, // ⬅️ New: adds breathing room under notch/header
            marginBottom: 12,
        },
        label: {
            fontWeight: '600',
            fontSize: 16,
            color: colors.text,
            marginBottom: 4,
        },
        subLabel: {
            fontWeight: '500',
            fontSize: 14,
            color: colors.secondaryText,
            marginBottom: 4,
        },
        pathRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
        },
        pathItem: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        pathText: {
            color: colors.primary,
            fontWeight: '500',
        },
        activePath: {
            fontWeight: '700',
            color: colors.accent,
        },
        separator: {
            marginHorizontal: 6,
            color: colors.secondaryText,
        },
        childText: {
            color: colors.text,
        },
    });
