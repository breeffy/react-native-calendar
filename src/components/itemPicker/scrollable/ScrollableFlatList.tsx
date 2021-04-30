import React, { forwardRef } from 'react';
import { FlatListProps, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { FlatList } from 'react-native-gesture-handler';
import { useCallbackOne } from 'use-memo-one';
import type { ScrollableCommon, ScrollableFlatListRef } from './types';

export const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const Component = AnimatedFlatList;

export interface ScrollableFlatListProps<T> extends ScrollableCommon<T> {
  initialScrollIndex: FlatListProps<T>['initialNumToRender'];
  initialNumToRender: FlatListProps<T>['initialNumToRender'];
  maxToRenderPerBatch: FlatListProps<T>['maxToRenderPerBatch'];
  windowSize: FlatListProps<T>['windowSize'];
  keyExtractor: FlatListProps<T>['keyExtractor'];
  getItemLayout: FlatListProps<T>['getItemLayout'];
}

const ScrollableFlatListComponent = <T,>(
  {
    items,
    initialScrollIndex,
    initialNumToRender,
    maxToRenderPerBatch,
    windowSize,
    horizontal,
    disableIntervalMomentum,
    snapToInterval,
    showsHorizontalScrollIndicator,
    scrollEventThrottle,
    decelerationRate,
    contentOffset,
    headerComponentStyle,
    footerComponentStyle,
    keyExtractor,
    getItemLayout,
    renderItem: _renderItem,
    onScroll
  }: ScrollableFlatListProps<T>,
  ref: ScrollableFlatListRef
) => {
  const renderItem = useCallbackOne(
    ({ item, index }) => {
      return _renderItem(item, index);
    },
    [_renderItem]
  );

  return (
    <Component
      // @ts-expect-error
      ref={ref}
      horizontal={horizontal}
      disableIntervalMomentum={disableIntervalMomentum}
      snapToInterval={snapToInterval}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      decelerationRate={decelerationRate}
      scrollEventThrottle={scrollEventThrottle}
      ListHeaderComponent={View}
      ListFooterComponent={View}
      ListHeaderComponentStyle={headerComponentStyle}
      ListFooterComponentStyle={footerComponentStyle}
      data={items}
      initialScrollIndex={initialScrollIndex}
      initialNumToRender={initialNumToRender}
      windowSize={windowSize}
      maxToRenderPerBatch={maxToRenderPerBatch}
      contentOffset={contentOffset}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      onScroll={onScroll}
    />
  );
};

export const ScrollableFlatList = forwardRef(ScrollableFlatListComponent);
