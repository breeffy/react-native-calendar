import React from 'react';
import {
  StyleSheet,
  StyleProp,
  TextStyle,
  View,
  ViewStyle
} from 'react-native';
import { usePickerTheme } from '../../hooks';
import { useMemoOne } from 'use-memo-one';
import { dayOfWeekWidth } from '../../constants';
import { textThemeToTextStyle } from '../../helpers';
import { usePickerInternal } from '../../hooks/usePickerInternal';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle
} from 'react-native-reanimated';
import { usePickerAnimated } from '../../hooks/usePickerAnimated';
import { toRad } from 'react-native-redash';
import type { PickerItemProps } from './types';

export type PickerItemComponentProps = PickerItemProps & {
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};
// export type PickerItemComponentProps = {
//   itemValue: number;
//   itemIndex: number;
//   itemsLength: number;
//   currentValue: Animated.SharedValue<number>;
//   currentIndex: Animated.SharedValue<number>;
//   containerWidth: number;
//   containerHeight: number;
//   itemWidth: number;
//   itemHeight: number;
//   containerStyle?: StyleProp<ViewStyle>;
//   textStyle?: StyleProp<TextStyle>;
// };

export const PickerItemComponent = ({
  itemValue,
  itemIndex,
  itemsLength,
  currentValue,
  currentIndex,
  containerStyle: _containerStyle,
  textStyle: _textStyle
}: PickerItemComponentProps) => {
  console.log(`BasePickerValue: value [${itemValue}], index [${itemIndex}]`);
  const theme = usePickerTheme();
  const { cellWidth, cellHeight } = usePickerInternal();
  // const { currentValue, currentIndex } = usePickerAnimated();

  // const _test_opacity = useDerivedValue(() => {
  //   const _opacity = interpolate(
  //     currentIndex.value,
  //     [index - 2, index - 1, index, index + 1, index + 2],
  //     [0.3, 0.6, 1, 0.6, 0.3],
  //     Extrapolate.CLAMP
  //   );
  //   console.log(
  //     `BasePickerValue: value [${value}], index [${index}], opacity [${opacity}]`
  //   );
  //   return _opacity;
  // }, [value]);
  //
  // const calendarDayTheme = useMemoOne(() => {
  //   switch (kind) {
  //     case CalendarDayKind.DEFAULT:
  //       return theme.day.default;
  //     case CalendarDayKind.DISABLED:
  //       return theme.day.disabled;
  //     case CalendarDayKind.ACTIVE:
  //       return theme.day.active;
  //     case CalendarDayKind.SELECTED:
  //       return theme.day.selected;
  //   }
  // }, [kind, theme]);
  //

  const containerStyle = useMemoOne(() => {
    return [
      styles.container,
      _containerStyle,
      { width: cellWidth, height: cellHeight }
    ];
  }, [_containerStyle, cellWidth, cellHeight]);

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      currentIndex.value,
      [itemIndex - 2, itemIndex - 1, itemIndex, itemIndex + 1, itemIndex + 2],
      [0.3, 0.6, 1, 0.6, 0.3],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      currentIndex.value,
      [itemIndex - 2, itemIndex - 1, itemIndex, itemIndex + 1, itemIndex + 2],
      [0.8, 0.9, 1.2, 0.9, 0.8],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      currentIndex.value,
      [itemIndex - 2, itemIndex - 1, itemIndex, itemIndex + 1, itemIndex + 2],
      [20, 0, -15, 0, 20],
      Extrapolate.CLAMP
    );

    const rotate = interpolate(
      currentIndex.value,
      [itemIndex - 2, itemIndex - 1, itemIndex, itemIndex + 1, itemIndex + 2],
      [toRad(40), toRad(20), 0, toRad(-20), toRad(-40)],
      Extrapolate.CLAMP
    );

    return {
      opacity: opacity,
      margin: 20,
      transform: [
        {
          scale
        },
        { translateY },
        {
          rotate: `${rotate}rad`
        }
      ]
    };
  }, []);

  const textStyle = useMemoOne(() => {
    // console.log(`textStyle: is called`);
    return [textThemeToTextStyle(theme.value), animatedTextStyle, _textStyle];
  }, [_textStyle, theme.value, cellWidth, cellHeight, animatedTextStyle]);

  // const textStyle = useMemoOne(() => {
  //   return [
  //     styles.container,
  //     styles.text,
  //     calendarDayThemeToTextStyle(calendarDayTheme),
  //     style
  //   ];
  // }, [calendarDayTheme]);

  // console.log(`textStyle is ${JSON.stringify(textStyle)}`);
  //     {/* <Text style={textStyle}>{String(hour)}</Text> */}

  return (
    <View style={containerStyle}>
      <Animated.Text style={textStyle}>{String(itemValue)}</Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: dayOfWeekWidth,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center'
    // backgroundColor: 'orange',
    // borderColor: 'orange',
    // borderWidth: 1
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
