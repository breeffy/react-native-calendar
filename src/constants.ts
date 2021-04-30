import { Dimensions } from 'react-native';
import { Easing } from 'react-native-reanimated';

export const Constants = Object.freeze({
  CalendarRows: 6,
  DaysInWeek: 7,
  AnimationDuration: 500,
  AnimationEasing: Easing.out(Easing.exp),
  ActivationOffset: 8
} as const);

export enum ANIMATION_STATE {
  UNDETERMINED = 0,
  RUNNING,
  STOPPED
}

export enum GESTURE {
  UNDETERMINED = 0,
  CONTENT,
  HANDLE
}

export enum ScrollState {
  UNDETERMINED = 0,
  DRAG_BEGIN,
  DRAG_END,
  MOMENTUM_BEGIN,
  MOMENTUM_END
}

const _window = Dimensions.get('window');
export const windowWidth = _window.width;
export const windowHeight = _window.height;
export const dayOfWeekWidth = (windowWidth - 32) / 7;

export const PickerConstants = Object.freeze({
  ValueWidth: 64,
  ValueHeight: 64
} as const);

export const CalendarPerformanceProps = Object.freeze({
  initialNumToRender: 1,
  windowSize: 2,
  maxToRenderPerBatch: 1,
  scrollEventThrottle: 16
} as const);
