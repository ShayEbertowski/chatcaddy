export const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

export function removeLastChar(str: string): string {
    return str.slice(0, -1);
}
