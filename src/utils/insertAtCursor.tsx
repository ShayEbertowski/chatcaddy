// utils/insertAtCursor.js
export function insertAtCursor(input, selection, value) {
  const { start } = selection;
  const before = input.slice(0, start);
  const after = input.slice(start);
  const updated = `${before}${value}${after}`;
  const newCursor = start + value.length;
  return { updated, newCursor };
}
