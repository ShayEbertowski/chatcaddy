import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function ComposerTabEntry() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/composer');
    }, []);

    return null;
}
