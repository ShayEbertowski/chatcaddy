// 👇 Run the shim as early as possible
import 'react-native-get-random-values';
import '../shim'; // technically redundant now, but safe

// Then re-export your root layout
export { default } from './_layout';
