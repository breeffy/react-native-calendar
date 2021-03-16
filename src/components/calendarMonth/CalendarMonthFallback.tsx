import React, { memo } from 'react';
// import { useCalendarInternal } from '../../hooks/useCalendarInternal';
import { useMemoOne } from 'use-memo-one';
import { DateTime } from 'luxon';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { CalendarMonthContainer } from './CalendarMonthContainer';
import isEqual from 'fast-deep-equal';
import type { CalendarYearAndMonth } from '../../types/public';

const defaultTextStyle: TextStyle = {
  fontSize: 30
};

export interface CalendarMonthFallbackProps {
  calendarYearAndMonth: CalendarYearAndMonth;
  formatString?: string;
  textStyle?: TextStyle;
}

/**
 * Default fallback component for blank-free mode
 */
export const CalendarMonthFallbackComponent = ({
  calendarYearAndMonth,
  formatString = 'LLLL, yyyy',
  textStyle
}: CalendarMonthFallbackProps) => {
  // const {
  //   activeCalendarDay,
  //   selectedDates,
  //   onCalendarDayStateChange
  // } = useCalendarInternal();
  // console.log(`CalendarMonthFallback: render`);

  const formattedYearAndMonth = useMemoOne(() => {
    return DateTime.fromObject(calendarYearAndMonth).toFormat(formatString);
  }, [calendarYearAndMonth, formatString]);

  return (
    <CalendarMonthContainer style={styles.container}>
      <Text style={styles.text} {...textStyle}>
        {formattedYearAndMonth}
      </Text>
    </CalendarMonthContainer>
  );
};

export const CalendarMonthFallback = memo(
  CalendarMonthFallbackComponent,
  isEqual
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1)'
    // backgroundColor: 'red'
  },
  text: {
    fontFamily: 'Gilroy-SemiBold',
    fontSize: 19,
    color: 'rgba(68, 82, 95, 0.9)',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginTop: 8,
    marginBottom: 8
  }
});
