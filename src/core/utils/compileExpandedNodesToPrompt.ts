// src/utils/composer/compileExpandedNodesToPrompt.ts

import { ExpandedNode } from './expandComposerTree';

export function compileExpandedNodesToPrompt(nodes: ExpandedNode[]): string {
    return nodes
        .map((node) => node.resolvedContent)
        .join('\n\n');  // <-- You can choose any separator format here
}
