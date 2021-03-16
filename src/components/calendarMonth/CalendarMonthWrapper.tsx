import type { PropsWithChildren } from 'react';

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { windowWidth } from '../../constants';

export interface CalendarMonthWrapperProps {}

export const CalendarMonthWrapper = ({
  children
}: PropsWithChildren<CalendarMonthWrapperProps>) => {
  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // flexDirection: 'row',
    width: windowWidth,
    // backgroundColor: 'rgba(255, 255, 255, 1)',
    paddingTop: 8
  }
});
