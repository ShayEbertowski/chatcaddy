import { Variable } from "./prompt";

export function toEditorVariables(
    vars: Record<string, Variable>
): Record<string, Variable> {
    return vars; // right now they're the same, but lets you future-proof
}

export function fromEditorVariables(
  vars: Record<string, Variable>
): Record<string, Variable> {
  return vars as unknown as Record<string, Variable>;
}