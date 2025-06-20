import { useEffect } from 'react';
import { router } from 'expo-router';
import { useComposerStore } from '../../../src/stores/useComposerStore';

export default function NewPromptComposerEntry() {
    useEffect(() => {
        const createAndOpen = async () => {
            const { treeId, rootId } = await useComposerStore.getState().createEmptyTree();
            router.replace(`/${treeId}/${rootId}`);
        };

        createAndOpen().catch(console.error);
    }, []);

    return null;
}
