import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { useColors } from '../../../src/hooks/useColors';
import { getSharedStyles } from '../../../src/styles/shared';
import { Entity } from '../../../src/types/entity';
import PromptSearch from '../../../src/components/prompt/PromptSearch';
import EmptyState from '../../../src/components/shared/EmptyState';
import PromptPathNavigator from '../../../src/components/composer/PromptPathNavigator';
import RichPromptEditor from '../../../src/components/editor/RichPromptEditor';
import { router } from 'expo-router';
import { composerStore } from '../../../src/core/composer/composerStore';
import { toEditorVariables, fromEditorVariables } from '../../../src/utils/composer/variables';
import { generateUUIDSync } from '../../../src/utils/uuid/generateUUIDSync';
import { useComposerEditingState } from '../../../src/stores/useComposerEditingState';
import { ComposerNode } from '../../../src/core/types/composer';

export default function ComposerIndexScreen() {
    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);
    const [mode, setMode] = useState<'Browse' | 'New' | 'Starters'>('Browse');
    const [hasEntities, setHasEntities] = useState<boolean>(true);
    const [draftStarted, setDraftStarted] = useState(false);


    useEffect(() => {
        if (mode === 'New' && !draftStarted) {
            setDraftStarted(true);
            handleNewPrompt();
        }
    }, [mode]);

    // Shared editing hook for draft tree
    const {
        currentNode,
        nodePath,
        updateNode,
        insertChildNode,
    } = useComposerEditingState('DRAFT', 'DRAFT');

    const starters = [
        "Best Summer Fruits",
        "Pizza Toppings by Age",
        "Pineapple Debate by Grade & State",
        "Favorite Ice Cream by State",
        "Birthday Party Themes",
        "Packing List for School Trip",
        "Bedtime Story Generator",
        "State Fair Foods",
        "Outdoor Activities",
        "Lunchbox for Picky Eaters",
        "Parent-Teacher Conference Questions"
    ];

    const handleSelectNode = async (prompt: Entity) => {
        const newTreeId = generateUUIDSync();
        const firstChildId = generateUUIDSync();

        const rootNode = {
            id: newTreeId,
            entityType: 'Prompt' as const,
            title: 'Root',
            content: '',
            variables: {},
            children: [{
                id: firstChildId,
                entityType: prompt.entityType as 'Prompt' | 'Function' | 'Snippet',
                title: prompt.title,
                content: prompt.content,
                variables: prompt.variables,
                children: [],
            }],
        };

        await composerStore.getState().createTree({
            id: newTreeId,
            name: prompt.title,
            rootNode,
            rootPromptId: prompt.id,
        });

        router.push(`/(drawer)/(composer)/${newTreeId}/${firstChildId}`);
    };

    const handleStarterSelect = async (title: string) => {
        const newTreeId = generateUUIDSync();
        const firstChildId = generateUUIDSync();

        const rootNode = {
            id: newTreeId,
            entityType: 'Prompt' as const,
            title: 'Root',
            content: '',
            variables: {},
            children: [{
                id: firstChildId,
                entityType: 'Prompt' as const,
                title,
                content: '',
                variables: {},
                children: [],
            }],
        };

        await composerStore.getState().createTree({
            id: newTreeId,
            name: title,
            rootNode,
        });

        router.push(`/(drawer)/(composer)/${newTreeId}/${firstChildId}`);
    };

    const handleSaveDraftTree = async () => {
        const root = nodePath[0];
        await composerStore.getState().createTree({
            id: root.id,
            name: currentNode.title || 'Untitled',
            rootNode: root,
        });

        router.push(`/(drawer)/(composer)/${root.id}/${currentNode.id}`);
    };

    const handleNewPrompt = async () => {
        const newTreeId = 'DRAFT';
        const rootId = generateUUIDSync();

        const rootNode: ComposerNode = {
            id: rootId,
            title: 'New Prompt',
            content: '',
            entityType: 'Prompt',
            variables: {},
            children: [],
        };

        await composerStore.getState().createTree({
            id: newTreeId,
            name: 'Untitled',
            rootNode,
        });

        router.push(`/(drawer)/(composer)/${newTreeId}/${rootId}`);
    };


    return (
        <ThemedSafeArea disableTopInset>
            <View style={{ flex: 1, padding: 16 }}>
                {/* Toggle Row */}
                <View style={sharedStyles.toggleRow}>
                    <ToggleButton title="Browse" mode={mode} setMode={setMode} />
                    <ToggleButton title="New" mode={mode} setMode={setMode} />
                    <ToggleButton title="Starters" mode={mode} setMode={setMode} />
                </View>

                {mode === 'Browse' && (
                    hasEntities ? (
                        <PromptSearch onSelect={handleSelectNode} />
                    ) : (
                        <EmptyState
                            title="No Prompts Yet"
                            subtitle="You haven't created any prompts."
                            buttonLabel="Create First Prompt"
                            onButtonPress={() => setMode('New')}
                        />
                    )
                )}

                {mode === 'New' && null}


                {/* Starters Mode */}
                {mode === 'Starters' && (
                    <View style={{ flex: 1 }}>
                        <FlatList
                            data={starters}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={{
                                        padding: 16,
                                        backgroundColor: colors.surface,
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.border,
                                    }}
                                    onPress={() => handleStarterSelect(item)}
                                >
                                    <Text style={{ color: colors.text }}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}
            </View>
        </ThemedSafeArea>
    );
}

function ToggleButton({ title, mode, setMode }: { title: string; mode: string; setMode: (mode: any) => void }) {
    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);
    const active = mode === title;

    return (
        <TouchableOpacity
            style={[sharedStyles.toggleButton, active && sharedStyles.toggleButtonSelected]}
            onPress={() => setMode(title as any)}
        >
            <Text style={[sharedStyles.toggleButtonText, active && sharedStyles.toggleButtonTextSelected]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}
