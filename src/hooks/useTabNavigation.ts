import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';

export function useTabNavigation() {
    return useNavigation<BottomTabNavigationProp<MainTabParamList>>();
}
