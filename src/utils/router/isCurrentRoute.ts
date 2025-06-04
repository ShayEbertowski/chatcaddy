import { useSegments } from 'expo-router';

export function useIsCurrentRoute(expected: string[]) {
    const segments = useSegments();

    // If segment lengths don't match, immediately false
    if (segments.length !== expected.length) return false;

    // Compare each segment safely
    return segments.every((segment, idx) => segment === expected[idx]);
}
