import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DimensionConstants } from '../../constants';
import { useMemoOne } from 'use-memo-one';
import type { PropsWithChildren } from 'react';
import type { ViewStyleProp, WithViewStyleProp } from '../../types';

export type CalendarMonthContainerProps = {} & WithViewStyleProp;

export const CalendarMonthContainer = ({
  children,
  style
}: PropsWithChildren<CalendarMonthContainerProps>) => {
  const containerStyle = useMemoOne<ViewStyleProp>(
    () => [styles.container, style],
    [styles.container, style]
  );
  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    width: DimensionConstants.monthWidth,
    minHeight: DimensionConstants.monthHeight,
    backgroundColor: 'red'
  }
});
