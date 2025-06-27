import { ComposerRunner } from "../src/components/composer/ComposerRunner";
import { useLocalSearchParams } from 'expo-router';


export default function RunPromptScreen() {
    const { treeId, nodeId } = useLocalSearchParams();

    return (
        <ComposerRunner
            treeId={treeId as string}
            nodeId={nodeId as string}
            readOnly={true}
            allowVariableInput={true}
        />
    );
}
