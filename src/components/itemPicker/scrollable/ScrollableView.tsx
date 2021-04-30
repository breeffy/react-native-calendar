import React, { forwardRef, useLayoutEffect } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import type { ScrollableCommon, ScrollableViewRef } from './types';

export const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export interface ScrollableViewProps<T> extends ScrollableCommon<T> {}

const ScrollableViewComponent = <T,>(
  {
    items,
    horizontal,
    disableIntervalMomentum,
    snapToInterval,
    showsHorizontalScrollIndicator,
    scrollEventThrottle,
    decelerationRate,
    contentOffset,
    headerComponentStyle,
    footerComponentStyle,
    renderItem,
    onScroll
  }: ScrollableViewProps<T>,
  ref: ScrollableViewRef
) => {
  useLayoutEffect(() => {}, []);

  return (
    <AnimatedScrollView
      ref={ref}
      horizontal={horizontal}
      disableIntervalMomentum={disableIntervalMomentum}
      snapToInterval={snapToInterval}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      decelerationRate={decelerationRate}
      scrollEventThrottle={scrollEventThrottle}
      contentOffset={contentOffset}
      overScrollMode="never"
      onScroll={onScroll}
    >
      <View style={headerComponentStyle} />
      {items.map((item, index) => {
        return renderItem(item, index);
      })}
      <View style={footerComponentStyle} />
    </AnimatedScrollView>
  );
};

export const ScrollableView = forwardRef(ScrollableViewComponent);
