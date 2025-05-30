export function filterByFolder<T extends { folder?: string }>(items: T[], selected: string): T[] {
  if (selected === 'All') return items;
  return items.filter(item => item.folder === selected);
}
