import React, { memo, useMemo } from 'react';
import { DateTime } from 'luxon';
import { StyleSheet, View } from 'react-native';
import { useCallbackOne, useMemoOne } from 'use-memo-one';
import { invariant } from '@breeffy/react-native-invariant';
import { CalendarDayPressable } from './CalendarDayPressable';
import { CalendarDayKind } from './CalendarDay';
import {
  calendarWeekContainsSomeDate,
  dateTimeArraysDifference,
  getCalendarDateFromId,
  getIdFromCalendarDate,
  isCalendarDatesEqual,
  isCalendarWeeksEqual,
  isCalendarYearAndMonthEqual
} from './helpers';
import type {
  CalendarDate,
  CalendarWeek,
  CalendarYearAndMonth,
  WithViewStyleProp
} from './types';

export type CalendarRowProps = {
  calendarWeek: CalendarWeek;
  calendarYearAndMonth: CalendarYearAndMonth;
  activeCalendarDay: CalendarDate;
  selectedDates: CalendarDate[];
  onCalendarDayPress?: (day: CalendarDate, kind: CalendarDayKind) => void;
} & WithViewStyleProp;

const CalendarRowComponent = ({
  calendarWeek,
  calendarYearAndMonth,
  activeCalendarDay,
  selectedDates: _selectedDates,
  style,
  onCalendarDayPress: _onCalendarDayPress
}: CalendarRowProps) => {
  invariant(
    calendarWeek.length === 7,
    `week should consist exactly of 7 days, but only has ${calendarWeek.length} days`
  );

  // console.log(
  //   `[CalendarRow] render: ${JSON.stringify(
  //     calendarYearAndMonth
  //   )}, ${JSON.stringify(calendarWeek)}`
  // );

  const activeCalendarDateTime = useMemoOne(() => {
    return DateTime.fromObject(activeCalendarDay).startOf('day');
  }, [activeCalendarDay]);

  const selectedDates = useMemoOne(() => {
    return _selectedDates.map((it) => getIdFromCalendarDate(it));
  }, [_selectedDates]);

  const onCalendarDayPress = useCallbackOne(
    (id: string, kind: CalendarDayKind) => {
      const calendarDate = getCalendarDateFromId(id);
      _onCalendarDayPress?.(calendarDate, kind);
    },
    [_onCalendarDayPress]
  );

  const containerStyle = useMemo(() => [styles.container, style], [style]);

  return (
    <View style={containerStyle}>
      {calendarWeek.map((dayOfWeek) => {
        const id = getIdFromCalendarDate(dayOfWeek);
        let kind = CalendarDayKind.DISABLED;
        if (dayOfWeek.month === calendarYearAndMonth.month) {
          /**
           * All days are CalendarDayKind.DEFAULT by default.
           * Later adjusting selected and active days.
           */

          kind = CalendarDayKind.DEFAULT;
          const isSelectedDay = selectedDates.some((it) => it === id);
          if (isSelectedDay) {
            kind = CalendarDayKind.SELECTED;
          } else {
            const isActiveDay = isCalendarDatesEqual(
              dayOfWeek,
              activeCalendarDateTime
            );
            if (isActiveDay) {
              kind = CalendarDayKind.ACTIVE;
            }
          }
        }

        return (
          <CalendarDayPressable
            id={id}
            key={id}
            kind={kind}
            day={dayOfWeek.day}
            onPress={onCalendarDayPress}
          />
        );
      })}
    </View>
  );
};

export const CalendarRow = memo(CalendarRowComponent, (prev, next) => {
  if (!isCalendarWeeksEqual(prev.calendarWeek, next.calendarWeek)) {
    return false;
  }

  const deletedDates = dateTimeArraysDifference(
    prev.selectedDates,
    next.selectedDates
  );

  const addedDates = dateTimeArraysDifference(
    next.selectedDates,
    prev.selectedDates
  );

  if (calendarWeekContainsSomeDate(next.calendarWeek, deletedDates)) {
    return false;
  } else if (calendarWeekContainsSomeDate(next.calendarWeek, addedDates)) {
    return false;
  }

  if (
    !isCalendarYearAndMonthEqual(
      prev.calendarYearAndMonth,
      next.calendarYearAndMonth
    )
  ) {
    return false;
  }

  if (!isCalendarDatesEqual(prev.activeCalendarDay, next.activeCalendarDay)) {
    return false;
  }

  if (prev.onCalendarDayPress !== next.onCalendarDayPress) {
    return false;
  }
  return true;
});

const styles = StyleSheet.create({
  container: {}
});
