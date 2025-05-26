// 👇 Add this FIRST — before anything else
import 'react-native-get-random-values';
import { registerRootComponent } from 'expo';

import React from 'react';
import { DefaultTheme, DrawerActions, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import * as IoniconGlyphs from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json';

import PromptLibraryScreen from './src/screens/PromptLibraryScreen';
import PromptSandboxScreen from './src/screens/PromptSandboxScreen';
import ToolboxScreen from './src/screens/ToolboxScreen';
import DemosScreen from './src/screens/DemosScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { ThemeProvider, useThemeMode } from './src/theme/ThemeProvider';
import AvatarDrawerButton from './src/components/AvatarDrawerButton';
import PromptFunctionsScreen from './src/screens/PromptFunctionsScreen';
import LibraryScreen from './src/screens/LibraryScreen';


const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const ToolboxStack = createNativeStackNavigator();


const isValidIconName = (name: string): name is keyof typeof IoniconGlyphs =>
  name in IoniconGlyphs;

function ToolboxNavigator() {
  return (
    <ToolboxStack.Navigator>
      <ToolboxStack.Screen name="ToolboxHome" component={ToolboxScreen} options={{ title: 'Toolbox' }} />
      <ToolboxStack.Screen name="PromptFunctions" component={PromptFunctionsScreen} options={{ title: 'Prompt Functions' }} />
    </ToolboxStack.Navigator>
  );
}

function MainTabs() {
  const { theme } = useThemeMode();
  const isDark = theme === 'dark';

  const tabBarColors = {
    backgroundColor: isDark ? '#121212' : '#f9f9f9',
    borderTopColor: isDark ? '#2c2c2e' : '#c6c6c8',
    activeTintColor: isDark ? '#0a84ff' : '#007aff',
    inactiveTintColor: isDark ? '#999' : '#8e8e93',
  };

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => {
        let iconName = 'apps';
        if (route.name === 'Library') iconName = 'book-outline';
        else if (route.name === 'Sandbox') iconName = 'chatbubble-outline';
        else if (route.name === 'Toolbox') iconName = 'construct-outline';
        else if (route.name === 'Demos') iconName = 'videocam-outline';

        return {
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={iconName as any} size={size} color={color} />
          ),
          tabBarActiveTintColor: tabBarColors.activeTintColor,
          tabBarInactiveTintColor: tabBarColors.inactiveTintColor,
          tabBarStyle: {
            backgroundColor: tabBarColors.backgroundColor,
            borderTopColor: tabBarColors.borderTopColor,
            borderTopWidth: 0.5,
          },
          headerShown: true, // ✅ Turn this back on
          headerLeft: () => (
            <AvatarDrawerButton /> // ✅ Make sure this uses navigation.dispatch(DrawerActions.openDrawer())
          ),
        };
      }}
    >

      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Sandbox" component={PromptSandboxScreen} />
      <Tab.Screen name="Toolbox" component={ToolboxNavigator} />
      <Tab.Screen name="Demos" component={DemosScreen} />
    </Tab.Navigator>
  );
}

function DrawerWrapper() {
  return (
    <Drawer.Navigator screenOptions={{ drawerType: 'back' }}>
      <Drawer.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

function AppWithTheme() {
  const { theme } = useThemeMode();
  const isDark = theme === 'dark';

  const ChatCaddyTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      background: isDark ? '#000' : '#fff',
    },
  };

  return (
    <NavigationContainer theme={ChatCaddyTheme}>
      <RootStack.Navigator>
        <RootStack.Screen
          name="Main"
          component={DrawerWrapper}
          options={{ headerShown: false }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

function AppRoot() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}

registerRootComponent(AppRoot);
export default AppRoot;
