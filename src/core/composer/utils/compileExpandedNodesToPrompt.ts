import { ExpandedNode } from './expandComposerTree';

export function compileExpandedNodesToPrompt(nodes: ExpandedNode[]): string {
    return nodes.map((node) => node.resolvedContent).join('\n\n');
}
