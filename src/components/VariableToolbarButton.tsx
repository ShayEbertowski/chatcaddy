import { TouchableOpacity, View, Text } from 'react-native';
import { Props } from '../types/components';



export default function VariableToolbarButton({ onPress }: Props) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
      <TouchableOpacity onPress={onPress} style={{
        backgroundColor: '#eee',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
      }}>
        <Text style={{ fontWeight: '600', color: '#007aff', fontSize: 14 }}>＋ Variable</Text>
      </TouchableOpacity>
    </View>
  );
}
