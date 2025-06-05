import * as Crypto from 'expo-crypto';

export async function generateUUID(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(16);

    // Convert random bytes to hex string
    const hex = [...randomBytes].map(b => b.toString(16).padStart(2, '0')).join('');

    // Format into UUID style (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    return [
        hex.substring(0, 8),
        hex.substring(8, 12),
        hex.substring(12, 16),
        hex.substring(16, 20),
        hex.substring(20),
    ].join('-');
}
