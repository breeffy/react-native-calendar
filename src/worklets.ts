import Animated, { Extrapolate, interpolate } from 'react-native-reanimated';
import { round } from 'react-native-redash';
import type {
  CalendarEndMonthFromCommonEra,
  CalendarStartMonthFromCommonEra
} from './types';
import type { InterpolateConfig } from './utils';

export const interpolateWithRound = (
  value: number,
  interpolateConfig: InterpolateConfig,
  precision: number | undefined = 4
) => {
  'worklet';
  return round(interpolate(value, ...interpolateConfig), precision);
};

export const calculateProgress = (
  value: number,
  inputRange: [number, number],
  precision: number | undefined = 4
): number => {
  'worklet';
  return round(
    interpolate(value, inputRange, [0, 100], Extrapolate.CLAMP),
    precision
  );
};

export const getIndexProgress = (
  index: number,
  interpolateConfig: InterpolateConfig
) => {
  'worklet';
  const input = interpolateConfig[0];
  const progressInput: [number, number] = [input[0], input[input.length - 1]];
  return calculateProgress(index, progressInput);
};

export const calculatePickerScrollProgress = (
  value: number,
  interpolateConfig: InterpolateConfig
) => {
  'worklet';
  const input = interpolateConfig[0];
  const progressInput: [number, number] = [input[0], input[input.length - 1]];
  return calculateProgress(value, progressInput);
};

export const calculateScrollProgress = (
  value: Animated.SharedValue<number>,
  inputRange: [CalendarStartMonthFromCommonEra, CalendarEndMonthFromCommonEra]
) => {
  'worklet';
  return calculateProgress(value.value, [inputRange[0], inputRange[1] - 1]);
};
