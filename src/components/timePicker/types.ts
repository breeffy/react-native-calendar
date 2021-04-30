import type Animated from 'react-native-reanimated';

export interface PickerItemProps {
  itemValue: number;
  itemIndex: number;
  itemsLength: number;
  maxVisibleItems: number;
  currentValue: Animated.SharedValue<number>;
  currentIndex: Animated.SharedValue<number>;
  pickerSize: number;
  containerHeight: number;
  itemWidth: number;
  itemHeight: number;
  itemSize: number;
}
