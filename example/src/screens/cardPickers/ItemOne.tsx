import React, { PropsWithChildren } from 'react';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle
} from 'react-native-reanimated';
import { useMemoOne } from 'use-memo-one';
import type { StyleProp, ViewStyle } from 'react-native';
import type { CardItemProps } from '@breeffy/react-native-calendar';

export interface CardPickerItemProps<T> extends CardItemProps<T> {
  style?: StyleProp<ViewStyle>;
}

export const ItemOne = <T,>({
  itemIndex,
  itemWidth,
  itemHeight,
  currentIndex,
  translates,
  scales,
  pickerBorderDistance,
  style: _style,
  children
}: PropsWithChildren<CardPickerItemProps<T>>) => {
  const style = useAnimatedStyle(() => {
    const opacity = interpolate(
      currentIndex.value,
      [
        itemIndex - 3,
        itemIndex - 2,
        itemIndex - 1,
        itemIndex,
        itemIndex + 1,
        itemIndex + 2,
        itemIndex + 3
      ],
      [0, 1, 1, 1, 1, 1, 1],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      currentIndex.value,
      [
        itemIndex - 3,
        itemIndex - 2,
        itemIndex - 1,
        itemIndex,
        itemIndex + 1,
        itemIndex + 2,
        itemIndex + 3
      ],
      [scales[3], scales[2], scales[1], scales[0], 1, 1, 1],
      Extrapolate.EXTEND
    );

    const translateX = interpolate(
      currentIndex.value,
      [
        itemIndex - 4,
        itemIndex - 3,
        itemIndex - 2,
        itemIndex - 1,
        itemIndex,
        itemIndex + 1,
        itemIndex + 2,
        itemIndex + 3
      ],
      [
        0,
        translates[3],
        translates[2],
        translates[1],
        translates[0],
        -pickerBorderDistance,
        -pickerBorderDistance,
        -pickerBorderDistance
      ],
      Extrapolate.CLAMP
    );

    return {
      width: itemWidth,
      height: itemHeight,
      overflow: 'hidden',
      opacity: opacity,
      transform: [
        {
          translateX: translateX
        },
        { scale: scale }
      ]
    };
  }, [translates, scales]);

  const containerStyle = useMemoOne(() => {
    return [_style, style];
  }, [_style, style]);

  return <Animated.View style={containerStyle}>{children}</Animated.View>;
};
