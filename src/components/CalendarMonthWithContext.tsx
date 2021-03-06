import React from 'react';
import { useCalendarInternal } from '../hooks/useCalendarInternal';
import { CalendarMonth } from './CalendarMonth';
import type { CalendarYearAndMonth } from '../types/public';

export interface CalendarMonthWithContextProps {
  calendarYearAndMonth: CalendarYearAndMonth;
}

/**
 * We pass most parameters, except `calendarYearAndMonth`,
 * using Context
 */
export const CalendarMonthWithContext = ({
  calendarYearAndMonth
}: CalendarMonthWithContextProps) => {
  const {
    activeCalendarDay,
    selectedDates,
    onCalendarDayStateChange
  } = useCalendarInternal();

  return (
    <CalendarMonth
      calendarYearAndMonth={calendarYearAndMonth}
      activeCalendarDay={activeCalendarDay}
      selectedDates={selectedDates}
      onCalendarDayPress={onCalendarDayStateChange}
    />
  );
};
