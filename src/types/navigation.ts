import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Library: undefined;
  Sandbox: {
    prefill?: string;
    autoRun?: boolean;
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
