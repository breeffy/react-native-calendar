import React, { memo } from 'react';
import { useCalendarInternal } from '../hooks/useCalendarInternal';
import { CalendarMonth } from './CalendarMonth';
import isEqual from 'fast-deep-equal';
import type { CalendarYearAndMonth } from '../types/public';

export interface CalendarMonthWithContextProps {
  calendarYearAndMonth: CalendarYearAndMonth;
}

/**
 * We pass most parameters, except `calendarYearAndMonth`,
 * using Context
 */
const CalendarMonthWithContextComponent = ({
  calendarYearAndMonth
}: CalendarMonthWithContextProps) => {
  console.log(
    `CalendarMonthWithContext [render]: ${JSON.stringify(calendarYearAndMonth)}`
  );
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

export const CalendarMonthWithContext = memo(
  CalendarMonthWithContextComponent,
  isEqual
);
