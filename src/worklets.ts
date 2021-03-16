import { PixelRatio } from 'react-native';
import Animated, { Extrapolate, interpolate } from 'react-native-reanimated';
import { round } from 'react-native-redash';
import { Constants } from './constants';
import type {
  CalendarEndMonthFromCommonEra,
  CalendarStartMonthFromCommonEra
} from './types';

const { ScreenFrameRate, MillisecondsInSecond } = Constants;
const PixelRationDensity = PixelRatio.get();

export const calculateProgress = (
  value: Animated.SharedValue<number>,
  inputRange: [number, number],
  precision: number | undefined = 4
): number => {
  'worklet';
  return round(
    interpolate(value.value, inputRange, [0, 100], Extrapolate.CLAMP),
    precision
  );
};

export const calculateScrollProgress = (
  value: Animated.SharedValue<number>,
  inputRange: [CalendarStartMonthFromCommonEra, CalendarEndMonthFromCommonEra]
) => {
  'worklet';
  return calculateProgress(value, [inputRange[0], inputRange[1] - 1]);
};

export const calculateMonthIndexProgress = (
  value: Animated.SharedValue<number>,
  inputRange: [CalendarStartMonthFromCommonEra, CalendarEndMonthFromCommonEra]
) => {
  'worklet';
  return interpolate(value.value, inputRange, [
    0,
    inputRange[1] - inputRange[0]
  ]);
};

export const estimateNextOffset = (velocity: number, offset: number) => {
  'worklet';
  // console.log(
  //   `MS: ${MillisecondsInSecond}, ScreenFrameRate: ${ScreenFrameRate}, PixelDensity: ${PixelRationDensity}`
  // );
  const distance =
    (velocity * MillisecondsInSecond) / (ScreenFrameRate * PixelRationDensity);
  return offset + distance;
};
