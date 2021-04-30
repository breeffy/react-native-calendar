import { createContext } from 'react';
import type Animated from 'react-native-reanimated';
export type CalendarAnimatedScrollProgress = Animated.SharedValue<number>;

export interface PickerAnimatedContextInterface {
  currentIndex: Animated.SharedValue<number>;
  currentProgress: Animated.SharedValue<number>;
  initialIndex: number;
}

// @ts-expect-error
export const PickerAnimatedContext = createContext<PickerAnimatedContextInterface>();
export const PickerAnimatedProvider = PickerAnimatedContext.Provider;
