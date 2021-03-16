/**
 * General and reusable types and interfaces definitions
 * Note: put only highly-reusable or public types / interfaces
 */

import type Animated from 'react-native-reanimated';

export type CalendarKind = 'gregorian';

export type CalendarYear = number;
export type CalendarMonth = number;
export type CalendarDay = number;

export type CalendarMonthFromCommonEra = number;

export interface CalendarYearAndMonth {
  year: CalendarYear;
  month: CalendarMonth;
}

export interface CalendarDate {
  year: CalendarYear;
  month: CalendarMonth;
  day: CalendarDay;
}

export type CalendarWeek = [
  CalendarDate,
  CalendarDate,
  CalendarDate,
  CalendarDate,
  CalendarDate,
  CalendarDate,
  CalendarDate
];

export interface CalendarMethods {
  /**
   * Select specific date on calendar.
   * If it is already selected function call is no-op.
   */
  select: (date: CalendarDate) => void;
  /**
   * Deselect specific date on calendar.
   * If it is not selected function call is no-op.
   */
  deselect: (date: CalendarDate) => void;
}

export type CalendarCurrentAnimatedMonthFromCommonEra = Animated.SharedValue<CalendarMonthFromCommonEra>;
export type CalendarCurrentAnimatedMonthInYear = Animated.SharedValue<number>;
export type CalendarStartMonthFromCommonEra = number;
export type CalendarEndMonthFromCommonEra = number;
export type CalendarAnimatedScrollProgress = Animated.SharedValue<number>;
export type CalendarAnimatedMonthIndex = Animated.SharedValue<number>;

export interface CalendarAnimatedYearAndMonth {
  year: Animated.SharedValue<CalendarYear>;
  month: Animated.SharedValue<CalendarMonth>;
}

export type CalendarSelectionMode = 'singleDay' | 'multipleDays';
