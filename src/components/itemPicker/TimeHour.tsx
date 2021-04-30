import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { useMemoOne } from 'use-memo-one';
import { dayOfWeekWidth } from '../../constants';
import { calendarDayThemeToTextStyle } from '../../helpers';
import { useCalendarTheme } from '../../hooks/useCalendarTheme';

export enum CalendarDayKind {
  DEFAULT,
  ACTIVE,

  SELECTED,
  DISABLED
}

export type TimeHourProps = {
  kind?: CalendarDayKind;
  hour: number;
  style?: StyleProp<TextStyle>;
};

export const TimeHour = ({
  kind = CalendarDayKind.DEFAULT,
  hour,
  style
}: TimeHourProps) => {
  // console.log(`CalendarDay: kind: ${kind}, day: ${day}`);
  const theme = useCalendarTheme();
  const calendarDayTheme = useMemoOne(() => {
    switch (kind) {
      case CalendarDayKind.DEFAULT:
        return theme.day.default;
      case CalendarDayKind.DISABLED:
        return theme.day.disabled;
      case CalendarDayKind.ACTIVE:
        return theme.day.active;
      case CalendarDayKind.SELECTED:
        return theme.day.selected;
    }
  }, [kind, theme]);

  const textStyle = useMemoOne(() => {
    return [
      styles.container,
      styles.text,
      calendarDayThemeToTextStyle(calendarDayTheme),
      style
    ];
  }, [calendarDayTheme]);

  // console.log(`textStyle is ${JSON.stringify(textStyle)}`);

  return (
    <>
      {/* <Text style={textStyle}>{String(hour)}</Text> */}
      <Text style={styles.container}>{String(hour)}</Text>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: dayOfWeekWidth,
    height: 38,
    backgroundColor: 'green'
  },
  circle: {
    position: 'absolute',
    alignItems: 'center'
  },
  text: {
    flexGrow: 1,
    textAlign: 'center',
    textAlignVertical: 'center'
  }
});
