import type Animated from 'react-native-reanimated';

export interface PickerItemProps<T> {
  item: T;
  itemIndex: number;
  itemWidth: number;
  itemHeight: number;
  itemSize: number;
  itemsLength: number;
  pickerWidth: number;
  pickerHeight: number;
  pickerSize: number;
  currentIndex: Animated.SharedValue<number>;
  currentProgress: Animated.SharedValue<number>;
}
