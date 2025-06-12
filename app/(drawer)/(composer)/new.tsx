import { useEffect } from 'react';
import { router } from 'expo-router';
import { generateUUIDSync } from '../../../src/utils/uuid/generateUUIDSync';
import { composerStore } from '../../../src/core/composer/composerStore';
import { ComposerNode } from '../../../src/core/types/composer';

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
                children: [],
            };

            await composerStore.getState().createTree({
                id: 'DRAFT',
                name: 'Untitled',
                rootNode,
            });

            router.replace(`/(drawer)/(composer)/DRAFT/${rootId}`);
        };

        createDraft();
    }, []);

    return null; // or loading spinner if you want
}
