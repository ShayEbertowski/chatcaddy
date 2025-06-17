import { useEffect } from 'react';
import { router } from 'expo-router';
import { generateUUIDSync } from '../../../src/utils/uuid/generateUUIDSync';
import { ComposerNode, useComposerStore } from '../../../src/stores/useComposerStore';

export default function NewPromptComposerEntry() {
    useEffect(() => {
        const createDraft = async () => {
            const rootId = generateUUIDSync();

            const rootNode: ComposerNode = {
                id: rootId,
                title: 'New Prompt',
                content: '',
                entityType: 'Prompt',
                variables: {},
                childIds: [],
                updatedAt: new Date().toISOString(),
            };

            await useComposerStore.getState().createEmptyTree(); // Optionally pass rootNode if createTree allows custom root

            useComposerStore.setState({
                activeTreeId: 'DRAFT',
                composerTree: {
                    id: 'DRAFT',
                    name: 'Untitled',
                    rootId,
                    nodes: { [rootId]: rootNode },
                    updatedAt: rootNode.updatedAt,
                },
            });

            router.replace(`/(drawer)/(composer)/DRAFT/${rootId}`);
        };

        createDraft();
    }, []);

    return null; // you could also return a loading spinner if desired
}
