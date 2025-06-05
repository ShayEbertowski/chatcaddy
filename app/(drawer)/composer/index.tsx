import React from 'react';
import { ComposerNodeView } from '../../../src/components/composer/ComposerNodeView';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { useComposerStore } from '../../../src/stores/useComposerStore';

export default function ComposerScreen() {
    const { root } = useComposerStore();
    return (
        <ThemedSafeArea>
            <ComposerNodeView node={root} />
        </ThemedSafeArea>
    );
}
