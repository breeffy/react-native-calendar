import React, { forwardRef, useImperativeHandle } from 'react';
import Animated, {
  useAnimatedReaction,
  useDerivedValue
} from 'react-native-reanimated';
import { useCallbackOne, useMemoOne } from 'use-memo-one';
import { getIndexProgress, interpolateWithRound } from '../../../worklets';
import { View } from 'react-native';
import { usePaddingLayout } from '../../../hooks/usePaddingLayout';
import { ScrollableView } from './ScrollableView';
import {
  ScrollableFlatList,
  ScrollableFlatListProps
} from './ScrollableFlatList';
import { usePagination } from '../../../hooks/usePagination';
import { useScroll } from '../../../hooks/useScroll';
import type { ScrollableCommon } from './types';
import type { PickerItemProps } from '../../itemPicker/types';
import type {
  ItemPickerPerformance,
  ItemPickerProps,
  ItemPickerScrollComponentKind
} from '../../../pickers/ItemPicker';
import type { InterpolateConfig } from '../../../utils';

interface ScrollableFlatList<T> extends ScrollableFlatListProps<T> {
  kind: 'flatlist';
}

export interface ScrollableProps<T, U extends ItemPickerScrollComponentKind>
  extends ItemPickerProps<T, U> {
  pickerWidth: number;
  pickerHeight: number;
  itemSize: number;
  currentIndex: Animated.SharedValue<number>;
  currentProgress: Animated.SharedValue<number>;
  itemsLength: number;
  indexInterpolateConfig: InterpolateConfig;
}

const ScrollableComponent = <T, U extends ItemPickerScrollComponentKind>(
  {
    items,
    initialIndex,
    mode,
    scrollMode,
    performance,
    scrollModeDeceleration,
    scrollComponentKind,
    pickerWidth,
    pickerHeight,
    pickerSize,
    itemWidth,
    itemHeight,
    itemSize,
    currentIndex,
    currentProgress,
    currentScrollState,
    indexInterpolateConfig,
    itemsLength,
    keyExtractor,
    renderItem: _renderItem
  }: Required<ScrollableProps<T, U>>,
  ref: any
) => {
  const pagination = usePagination({ scrollMode, itemSize });
  console.log(
    `pagination: ${JSON.stringify(
      pagination
    )}, scrollMode: ${scrollMode}, itemSize: ${itemSize}`
  );
  const containerLayout = useMemoOne(() => {
    return {
      width: pickerWidth,
      height: pickerHeight
    };
  }, [pickerWidth, pickerHeight]);

  console.log(
    `mode: ${mode}, containerWidth: ${pickerWidth}, containerHeight: ${pickerHeight}, itemWidth: ${itemWidth}, itemHeight: ${itemHeight}`
  );

  const headerLayout = usePaddingLayout({
    mode,
    containerWidth: pickerWidth,
    containerHeight: pickerHeight,
    itemWidth,
    itemHeight
  });

  console.log(`paddingLayout: ${JSON.stringify(headerLayout)}`);

  const {
    scrollRef,
    scrollHandler,
    scrollContentOffset,
    scrollState
  } = useScroll();

  const offset = useDerivedValue(() => {
    return mode === 'horizontal'
      ? scrollContentOffset.value.x
      : scrollContentOffset.value.y;
  }, [mode]);

  useAnimatedReaction(
    () => {
      // console.log(`offset: ${offset.value}`);
      const index = interpolateWithRound(offset.value, indexInterpolateConfig);
      const progress = getIndexProgress(index, indexInterpolateConfig);
      const state = scrollState.value;
      return [index, progress, state] as const;
    },
    (array) => {
      currentIndex.value = array[0];
      currentProgress.value = array[1];
      currentScrollState.value = array[2];
    },
    []
  );

  useImperativeHandle(ref, () => scrollRef);

  const renderItem = useCallbackOne<(item: T, index: number) => JSX.Element>(
    (item, index) => {
      // console.log(`item is ${JSON.stringify(item)}`);
      const props: PickerItemProps<T> = {
        item: item,
        itemIndex: index,
        itemWidth: itemWidth,
        itemHeight: itemHeight,
        itemSize: itemSize,
        itemsLength: itemsLength,
        currentIndex: currentIndex,
        currentProgress: currentProgress,
        pickerWidth: pickerWidth,
        pickerHeight: pickerHeight,
        pickerSize: pickerSize
      };

      const key = keyExtractor(item, index);
      return (
        <View
          key={key}
          style={{
            width: props.itemWidth,
            height: props.itemHeight,
            zIndex: -1 * props.itemIndex
            // backgroundColor: 'red',
            // borderWidth: 2,
            // borderColor: 'green'
          }}
        >
          {_renderItem(props)}
        </View>
      );
    },
    [
      _renderItem,
      itemWidth,
      itemHeight,
      itemSize,
      itemsLength,
      currentIndex,
      currentProgress,
      pickerWidth,
      pickerHeight,
      pickerSize
    ]
  );

  const getItemLayout = useCallbackOne(
    (_: T[] | null | undefined, index: number) => {
      return {
        length: itemSize,
        offset: itemSize * index,
        index
      };
    },
    [itemSize]
  );

  const horizontal = useMemoOne(() => {
    return mode === 'horizontal';
  }, [mode]);

  console.log(`containerWidth: ${pickerWidth}, cellWidth: ${itemWidth}`);
  console.log(`paddingLayout: ${JSON.stringify(headerLayout)}`);

  const contentOffset = useMemoOne(() => {
    if (scrollComponentKind === 'scrollview') {
      const offset = initialIndex * itemSize;
      if (mode === 'horizontal') {
        return {
          x: offset,
          y: 0
        };
      } else {
        return {
          x: 0,
          y: offset
        };
      }
    }
    return;
  }, [mode, initialIndex, itemSize, scrollComponentKind]);

  const commonProps = useMemoOne<ScrollableCommon<T>>(() => {
    return {
      items: items,
      disableIntervalMomentum: pagination.disableIntervalMomentum,
      snapToInterval: pagination.snapToInterval,
      scrollEventThrottle: performance?.scrollEventThrottle,
      horizontal: horizontal,
      showsHorizontalScrollIndicator: false,
      decelerationRate: scrollModeDeceleration,
      contentOffset: contentOffset,
      headerComponentStyle: headerLayout,
      footerComponentStyle: headerLayout,
      renderItem: renderItem,
      onScroll: scrollHandler
    };
  }, [
    items,
    pagination,
    performance,
    horizontal,
    scrollModeDeceleration,
    contentOffset,
    headerLayout,
    renderItem,
    scrollHandler
  ]);

  const ScrollableComponent = useMemoOne(() => {
    if (scrollComponentKind === 'flatlist') {
      const perf = performance as ItemPickerPerformance<'flatlist'>;
      const flatlistProps: ScrollableFlatListProps<T> = {
        ...commonProps,
        initialScrollIndex: initialIndex,
        initialNumToRender: perf.initialNumToRender,
        maxToRenderPerBatch: perf.maxToRenderPerBatch,
        windowSize: perf.windowSize,
        keyExtractor: keyExtractor,
        getItemLayout: getItemLayout
      };
      return <ScrollableFlatList {...flatlistProps} />;
    } else {
      return <ScrollableView {...commonProps} />;
    }
  }, [commonProps, initialIndex, performance]);

  return <View style={containerLayout}>{ScrollableComponent}</View>;
};

export const Scrollable = forwardRef(ScrollableComponent);
