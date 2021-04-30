import React from 'react';
import { Text, View } from 'react-native';
import AnimateableText from 'react-native-animateable-text';
import { TimePicker as CalendarTimePicker } from '@breeffy/react-native-calendar';
import { useContainerStyle } from './hooks';

import type { CalendarProps } from '@breeffy/react-native-calendar';
import {
  useAnimatedProps,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

export interface TimePickerProps {
  selectionMode?: CalendarProps['selectionMode'];
}

export const TimePicker = ({ selectionMode }: TimePickerProps) => {
  const values = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
  const containerStyle = useContainerStyle();
  const value = useSharedValue(0);
  const index = useSharedValue(0);

  const propsForValue = useAnimatedProps(() => {
    return {
      text: String(value.value)
    };
  });

  const propsForIndex = useAnimatedProps(() => {
    return {
      text: String(index.value)
    };
  });
  return (
    <View style={[containerStyle, { justifyContent: 'center' }]}>
      <CalendarTimePicker
        items={values}
        maxVisibleValues={5}
        currentValue={value}
        currentIndex={index}
      />
      <View
        style={{
          alignItems: 'center',
          marginBottom: 50
        }}
      >
        <Text style={{ fontSize: 20 }}>Value:</Text>
        <AnimateableText
          animatedProps={propsForValue}
          style={{ fontSize: 20 }}
        />
        <Text style={{ fontSize: 20 }}>Index:</Text>
        <AnimateableText
          animatedProps={propsForIndex}
          style={{ fontSize: 20 }}
        />
      </View>
    </View>
  );
};
