// 👇 Add this FIRST — before anything else
import 'react-native-get-random-values';
import { registerRootComponent } from 'expo';
import AppRoot from './App';
registerRootComponent(AppRoot);
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as IoniconGlyphs from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json';
import PromptLibraryScreen from './src/screens/PromptLibraryScreen';
import PromptSandboxScreen from './src/screens/PromptSandboxScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const ChatCaddyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff', // ← this is the global screen background
  },
};

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

const isValidIconName = (name: string): name is keyof typeof IoniconGlyphs => {
  return name in IoniconGlyphs;
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        let iconName: string = 'apps';

        if (route.name === 'Library') iconName = 'book-outline';
        else if (route.name === 'Sandbox') iconName = 'chatbubble-outline';
        else if (route.name === 'Settings') iconName = 'settings-outline';

        const safeIconName: keyof typeof IoniconGlyphs =
          isValidIconName(iconName) ? iconName : 'alert';

        return {
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={safeIconName} size={size} color={color} />
          ),
          tabBarActiveTintColor: '#007aff',
          tabBarInactiveTintColor: '#8e8e93',
          tabBarStyle: {
            backgroundColor: '#f9f9f9', // iOS-like tab bar background
            borderTopColor: '#c6c6c8',  // iOS-like top divider
            borderTopWidth: 0.5,
          },
          headerShown: false,
        };
      }}
    >

      <Tab.Screen name="Library" component={PromptLibraryScreen} />
      <Tab.Screen name="Sandbox" component={PromptSandboxScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer theme={ChatCaddyTheme}>
      <RootStack.Navigator>
        {/* Main tabs at the bottom */}
        <RootStack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
