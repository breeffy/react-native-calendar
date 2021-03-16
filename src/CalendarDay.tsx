import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useMemoOne } from 'use-memo-one';
import { Circle } from './components/Svg';
import { dayOfWeekWidth } from './constants';
import type { WithViewStyleProp } from './types';

export enum CalendarDayKind {
  DEFAULT,
  ACTIVE,
  SELECTED,
  DISABLED
}

export type CalendarDayProps = {
  kind?: CalendarDayKind;
  day: number;
} & WithViewStyleProp;

export const CalendarDay = ({
  kind = CalendarDayKind.DEFAULT,
  day,
  style
}: CalendarDayProps) => {
  // console.log(`CalendarDay: kind: ${kind}, day: ${day}`);
  const textColor = useMemoOne(() => {
    switch (kind) {
      case CalendarDayKind.DEFAULT:
        return 'rgba(68, 82, 95, 0.9)';
      case CalendarDayKind.DISABLED:
        return 'rgba(68, 82, 95, 0.3)';
      case CalendarDayKind.ACTIVE:
        return 'rgba(45, 154, 252, 1)';
      case CalendarDayKind.SELECTED:
        return 'rgba(45, 154, 252, 1)';
    }
  }, [kind]);

  const containerStyle = useMemoOne(() => {
    return [styles.container, style];
  }, [styles.container, style]);

  const textStyle = useMemoOne(() => {
    return [styles.text, { color: textColor }];
  }, [styles.text, textColor]);

  return (
    <View style={containerStyle}>
      {kind === CalendarDayKind.SELECTED && <Circle style={styles.circle} />}
      <Text style={textStyle}>{String(day)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: dayOfWeekWidth,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circle: {
    position: 'absolute'
  },
  text: {
    flexGrow: 1,
    fontFamily: 'Gilroy-Medium',
    fontSize: 16,
    textAlign: 'center',
    textAlignVertical: 'center'
  }
});
