import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Calendar,
  CalendarMonthFallback,
  CalendarProps
} from '@breeffy/react-native-calendar';
import type { CalendarMethods } from '@breeffy/react-native-calendar';
import type { WithViewStyleProp } from '../../../../src/types';
import { useCallbackOne } from 'use-memo-one';

type CalendarRenderFallbackMonth = NonNullable<
  CalendarProps['renderFallbackMonth']
>;

export type CalendarSheetProps = {
  scrollEnabled?: boolean;
  onDaySelectionChange?: CalendarProps['onDaySelectionChange'];
} & WithViewStyleProp;

export const CalendarSheet = ({
  style,
  onDaySelectionChange
}: CalendarSheetProps) => {
  const calendarRef = useRef<CalendarMethods>(null);

  const renderFallbackMonth = useCallbackOne<CalendarRenderFallbackMonth>(
    (yearAndMonth) => {
      return <CalendarMonthFallback calendarYearAndMonth={yearAndMonth} />;
    },
    []
  );

  return (
    <View style={[styles.container, style]}>
      <Calendar
        style={styles.calendar}
        ref={calendarRef}
        selectionMode="singleDay"
        // scrollMode="multipleMonths"
        scrollMode="anyOffset"
        // scrollModeDeceleration="fast"
        scrollModeDeceleration="normal"
        monthsBefore={0}
        monthsAfter={100}
        renderFallbackMonth={renderFallbackMonth}
        onDaySelectionChange={onDaySelectionChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 1)'
  },
  calendar: {}
});
