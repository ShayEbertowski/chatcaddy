import { NavigatorScreenParams } from '@react-navigation/native';
import { Prompt } from './prompt';

export type MainTabParamList = {
  Library: undefined;
  Sandbox: {
    autoRun?: boolean;
    prompt?: Prompt;
    editId?: string;
  };
  Settings: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  'Edit Prompt': {
    prompt: {
      id: string;
      title: string;
      content: string;
    };
  };
};

export type ToolboxStackParamList = {
  ToolboxHome: undefined;
  PromptFunctions: undefined;
  // Add more Toolbox-related screens as needed
};