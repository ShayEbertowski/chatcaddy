import type { Entity, PromptEntity, FunctionEntity } from "../../types/entity";

export function isPrompt(entity: Entity | null | undefined): entity is PromptEntity {
    return entity?.entityType === 'Prompt';
}

export function isFunction(entity: Entity | null | undefined): entity is FunctionEntity {
    return entity?.entityType === 'Function';
}
