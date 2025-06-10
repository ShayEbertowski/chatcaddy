import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import RichPromptEditor from '../../../src/components/editor/RichPromptEditor';
import PromptSearch from '../../../src/components/prompt/PromptSearch';
import EmptyState from '../../../src/components/shared/EmptyState';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { useColors } from '../../../src/hooks/useColors';
import { getSharedStyles } from '../../../src/styles/shared';
import { Entity, EntityType } from '../../../src/types/entity';
import { router } from 'expo-router';
import { composerStore } from '../../../src/core/composer/composerStore';
import { ComposerNode } from '../../../src/core/types/composer';
import { generateUUIDSync } from '../../../src/utils/uuid/generateUUIDSync';
import { Variable } from '../../../src/types/prompt';
import { UIEntityType } from '../../../src/types/entity';


export default function ComposerIndexScreen() {
    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);
    const [mode, setMode] = useState<'Browse' | 'New' | 'Starters'>('Browse');
    const [newContent, setNewContent] = useState('');

    const [entityType, setEntityType] = useState<UIEntityType>('Prompt');
    const [hasEntities, setHasEntities] = useState<boolean>(true);
    const [variables, setVariables] = useState<Record<string, Variable>>({});


    // 🚧 Hardcoded Starter List for future community seeding
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

        const firstChild: ComposerNode = {
            id: firstChildId,
            entityType: prompt.entityType as 'Prompt' | 'Function' | 'Snippet', // ✅ fixed here
            title: prompt.title,
            content: prompt.content,        // ✅ populate original content
            variables: prompt.variables,    // ✅ include any variables!
            children: [],
        };


        const rootNode: ComposerNode = {
            id: newTreeId,
            entityType: 'Prompt',
            title: 'Root',
            content: '',
            variables: {},
            children: [firstChild],
        };

        await composerStore.getState().createTree({
            id: newTreeId,
            name: prompt.title,
            rootNode,
            rootPromptId: prompt.id,
        });

        router.push(`/(drawer)/(composer)/${newTreeId}/${firstChildId}`);
    };

    const handleCreate = async () => {
        const newTreeId = generateUUIDSync();
        const firstChildId = generateUUIDSync();

        const firstChild: ComposerNode = {
            id: firstChildId,
            entityType: entityType, // ✔ already safe
            title: newContent,
            content: '',
            variables: {},
            children: [],
        };

        const rootNode: ComposerNode = {
            id: newTreeId,
            entityType: 'Prompt',
            title: 'Root',
            content: '',
            variables: {},
            children: [firstChild],
        };

        await composerStore.getState().createTree({
            id: newTreeId,
            name: newContent,
            rootNode,
        });

        router.push(`/(drawer)/(composer)/${newTreeId}/${firstChildId}`);
    };


    const handleStarterSelect = async (starterTitle: string) => {
        const newTreeId = generateUUIDSync();
        const firstChildId = generateUUIDSync();

        const firstChild: ComposerNode = {
            id: firstChildId,
            entityType: 'Prompt',
            title: starterTitle,
            content: '',
            variables: {},
            children: [],
        };

        const rootNode: ComposerNode = {
            id: newTreeId,
            entityType: 'Prompt',
            title: 'Root',
            content: '',
            variables: {},
            children: [firstChild],
        };

        await composerStore.getState().createTree({
            id: newTreeId,
            name: starterTitle,
            rootNode,
        });

        router.push(`/(drawer)/(composer)/${newTreeId}/${firstChildId}`);
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

                {/* Main Content */}
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

                {mode === 'New' && (
                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                        <View style={{ marginTop: 16 }}>
                            <RichPromptEditor
                                text={newContent}
                                onChangeText={setNewContent}
                                entityType={entityType}
                                onChangeEntityType={setEntityType}
                                variables={variables} // ✅ now included
                                onChangeVariables={setVariables} // ✅ now included
                            />

                        </View>

                        <TouchableOpacity
                            style={{
                                backgroundColor: colors.primary,
                                padding: 16,
                                borderRadius: 8,
                                alignItems: 'center',
                                marginTop: 16,
                            }}
                            onPress={handleCreate}
                        >
                            <Text style={{ color: colors.onPrimary, fontWeight: 'bold' }}>Save</Text>
                        </TouchableOpacity>
                    </View>
                )}

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

// Helper toggle button component
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
