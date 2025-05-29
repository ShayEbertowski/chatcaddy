import { Redirect } from 'expo-router';

export default function Index() {
    // Change the route below to your preferred default tab
    return <Redirect href="/(tabs)/library" />;
}
