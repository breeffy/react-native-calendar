import Animated from 'react-native-reanimated';
import { FlatList, ScrollView } from 'react-native-gesture-handler';

export const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
export const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
