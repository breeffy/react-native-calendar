import { createContext } from 'react';
import type {
  CalendarCurrentAnimatedMonthFromCommonEra,
  CalendarEndMonthFromCommonEra,
  CalendarStartMonthFromCommonEra,
  CalendarAnimatedScrollProgress,
  CalendarCurrentAnimatedMonthInYear,
  CalendarAnimatedMonthIndex
} from '../types';

export interface CalendarAnimatedContextInterface {
  calendarAnimatedCommonEraMonth: CalendarCurrentAnimatedMonthFromCommonEra;
  calendarCurrentAnimatedMonthInYear: CalendarCurrentAnimatedMonthInYear;
  calendarStartMonthFromCommonEra: CalendarStartMonthFromCommonEra;
  calendarEndMonthFromCommonEra: CalendarEndMonthFromCommonEra;
  calendarAnimatedScrollProgress: CalendarAnimatedScrollProgress;
  calendarAnimatedMonthIndex: CalendarAnimatedMonthIndex;
}

// @ts-expect-error
export const CalendarAnimatedContext = createContext<CalendarAnimatedContextInterface>();
export const CalendarAnimatedProvider = CalendarAnimatedContext.Provider;
