import { Entity } from "../../types/entity";
import { normalizeVariables } from "../prompt/promptManager";

export function normalizeEntity(entity: Entity): Entity {
    if ('variables' in entity && entity.variables) {
        return {
            ...entity,
            variables: normalizeVariables(entity.variables),
        };
    }
    return entity;
}