import { Entity } from "../../types/entity";
import { Prompt, PromptFunction } from "../../types/prompt";

export function isPrompt(entity: Entity | null | undefined): entity is Prompt {
    return entity?.entityType === 'Prompt';
}

export function isFunction(entity: Entity | null | undefined): entity is PromptFunction {
    return entity?.entityType === 'Function';
}
