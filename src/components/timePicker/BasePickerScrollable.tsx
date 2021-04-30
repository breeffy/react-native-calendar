import React, { forwardRef, useImperativeHandle } from 'react';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedReaction,
  useDerivedValue
} from 'react-native-reanimated';
import { FlatList as RNGestureHandlerFlatList } from 'react-native-gesture-handler';
import { useCallbackOne, useMemoOne } from 'use-memo-one';
import { getIdFromCalendarYearAndMonth } from '../../helpers';
import { useCalendarScroll } from '../../hooks/useCalendarScrollView';
import { useCalendarInternal } from '../../hooks/useCalendarInternal';
import { useCalendarAnimated } from '../../hooks';
import {
  CalendarPerformanceProps,
  ScrollState,
  windowWidth
} from '../../constants';
import {
  calculatePickerScrollProgress,
  calculateProgress,
  calculateScrollProgress,
  interpolateWithRound
} from '../../worklets';
import { round } from 'react-native-redash';
import {
  getStartOfEveryMonth,
  range,
  getPickerInterpolateConfig
} from '../../utils';
import { TimeHour } from './TimeHour';
import { FlatListProps, ListRenderItem, PixelRatio, View } from 'react-native';
import type { CalendarYearAndMonth } from '../../types';
import type { BasePickerProps } from './BasePicker';
import { usePickerAnimated } from '../../hooks/usePickerAnimated';
import { PickerItemComponent } from './PickerItemComponent';
import type { FlatList } from 'react-native';
import { usePickerInternal } from '../../hooks/usePickerInternal';
import { useItemSize } from '../../hooks/useItemSize';
import { usePaddingLayout } from '../../hooks/usePaddingLayout';

// @ts-expect-error
const AnimatedFlatList: typeof FlatList = Animated.createAnimatedComponent(
  // @ts-ignore
  RNGestureHandlerFlatList
);

export interface BasePickerScrollableProps {
  scrollMode: BasePickerProps['scrollMode'];
  scrollModeDeceleration: FlatListProps<any>['decelerationRate'];
  performanceProps: BasePickerProps['performanceProps'];
  renderItem: BasePickerProps['renderItem'];
}

export const BasePickerScrollable = forwardRef<any, BasePickerScrollableProps>(
  (
    {
      scrollMode,
      scrollModeDeceleration,
      performanceProps = CalendarPerformanceProps,
      renderItem: _renderItem
    },
    ref
  ) => {
    const scrollModeProps = useMemoOne<Partial<FlatListProps<any>>>(() => {
      if (scrollMode === 'oneValue') {
        return {
          pagingEnabled: true
        };
      } else if (scrollMode === 'multipleValues') {
        return {
          snapToInterval: windowWidth
        };
      } else {
        return {};
      }
    }, [scrollMode]);

    const {
      values,
      initialIndex,
      currentValue,
      currentIndex
    } = usePickerAnimated();
    const {
      mode,
      itemsLength,
      containerWidth,
      containerHeight,
      cellWidth,
      cellHeight,
      interpolateConfigs
    } = usePickerInternal();

    const cellSize = useItemSize({
      mode,
      itemWidth: cellWidth,
      itemHeight: cellHeight
    });

    const paddingLayout = usePaddingLayout({
      mode,
      containerWidth,
      containerHeight,
      itemWidth: cellWidth,
      itemHeight: cellHeight
    });

    const {
      scrollRef,
      scrollHandler,
      scrollState,
      scrollContentOffset,
      scrollContentSize
    } = useCalendarScroll();

    // const interpolateConfig = useMemoOne(() => {
    //   return getPickerInterpolateConfig(values, cellSize);
    // }, [values, cellSize]);

    console.log(`interpolateConfigs: ${JSON.stringify(interpolateConfigs)}`);

    const offset = useDerivedValue(() => {
      return mode === 'horizontal'
        ? scrollContentOffset.value.x
        : scrollContentOffset.value.y;
    }, [mode]);

    useAnimatedReaction(
      () => {
        return [
          interpolateWithRound(offset.value, interpolateConfigs.value),
          interpolateWithRound(offset.value, interpolateConfigs.index)
        ];
      },
      (array) => {
        currentValue.value = array[0];
        currentIndex.value = array[1];
      },
      []
    );

    // // const selectedValue = useDerivedValue(() => {
    // //   return interpolateWithRound(offset.value, interpolateConfig);
    // // }, [mode, interpolateConfig]);

    const progress = useDerivedValue(() => {
      return calculatePickerScrollProgress(
        offset.value,
        interpolateConfigs.value
      );
    }, [interpolateConfigs.value]);

    useImperativeHandle(ref, () => scrollRef);

    useDerivedValue(() => {
      // console.log(
      //   `scrollContentSize: ${JSON.stringify(scrollContentSize.value.width)}`
      // );
      // console.log(
      //   `scrollContentOffset: ${JSON.stringify(scrollContentOffset.value)}`
      // );
      // console.log(`value: ${selectedValue.value}, progress: ${progress.value}`);
      // console.log(
      //   `BasePickerScrollable: value [${scrollContentOffset}], scroll state [${scrollState}]`
      // );
      // if (scrollState.value !== ScrollState.UNDETERMINED) {
      //   calendarAnimatedCommonEraMonth.value = round(
      //     interpolate(
      //       scrollContentOffset.value.x,
      //       [0, scrollContentSize.value.width - windowWidth],
      //       [calendarStartMonthFromCommonEra, calendarEndMonthFromCommonEra],
      //       Extrapolate.CLAMP
      //     ),
      //     4
      //   );
      //   calendarCurrentAnimatedMonthInYear.value =
      //     calendarAnimatedCommonEraMonth.value % 12;
      //   calendarAnimatedScrollProgress.value = calculateScrollProgress(
      //     calendarAnimatedCommonEraMonth,
      //     [calendarStartMonthFromCommonEra, calendarEndMonthFromCommonEra]
      //   );
      // }
    }, []);

    const renderItem = useCallbackOne<ListRenderItem<number>>(
      ({ item, index }) => {
        console.log(`item is ${JSON.stringify(item)}`);
        const props = {
          itemValue: item,
          itemIndex: index,
          itemsLength: itemsLength,
          currentIndex: currentIndex,
          currentValue: currentValue,
          containerWidth: containerWidth,
          containerHeight: containerHeight,
          itemWidth: cellWidth,
          itemHeight: cellHeight
        };

        if (_renderItem !== undefined) {
          return (
            <View
              style={{
                width: props.itemWidth,
                height: props.itemHeight
                // backgroundColor: 'red',
                // borderWidth: 2,
                // borderColor: 'green'
              }}
            >
              {_renderItem(props)}
            </View>
          );
        } else {
          return <PickerItemComponent {...props} />;
        }
      },
      [_renderItem]
    );

    const keyExtractor = useCallbackOne((item: number, _: number) => {
      return String(item);
    }, []);

    const getItemLayout = useCallbackOne(
      (_: number[] | null | undefined, index: number) => {
        return {
          length: cellSize,
          offset: cellSize * index,
          index
        };
      },
      [cellSize]
    );

    return (
      <AnimatedFlatList
        // style={{ backgroundColor: 'orange' }}
        ListHeaderComponent={View}
        // ListHeaderComponentStyle={[paddingLayout, { backgroundColor: 'green' }]}
        ListHeaderComponentStyle={paddingLayout}
        ListFooterComponent={View}
        ListFooterComponentStyle={paddingLayout}
        // @ts-ignore
        ref={scrollRef}
        data={values}
        initialScrollIndex={initialIndex}
        horizontal={mode === 'horizontal'}
        showsHorizontalScrollIndicator={false}
        decelerationRate={scrollModeDeceleration}
        // initialNumToRender={performanceProps.initialNumToRender}
        // windowSize={performanceProps.windowSize}
        maxToRenderPerBatch={performanceProps.maxToRenderPerBatch}
        scrollEventThrottle={performanceProps.scrollEventThrottle}
        onScroll={scrollHandler}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        {...scrollModeProps}
      />
    );
  }
);
