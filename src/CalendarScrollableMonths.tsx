import React, { useMemo, useRef } from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItem,
  ViewStyle,
  PixelRatio
} from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';
import { useCallbackOne, useMemoOne } from 'use-memo-one';
import {
  getIdFromCalendarYearAndMonth,
  isCalendarYearAndMonthEqual,
  isIndexInRangeInclusive
} from './helpers';
import { useCalendarScroll } from './hooks/useCalendarScrollView';
import { useCalendarInternal } from './hooks/useCalendarInternal';
import { useCalendarAnimated, useCalendarMonths } from './hooks';
import { ScrollState, windowWidth, ViewabilityConfig } from './constants';
import {
  calculateMonthIndexProgress,
  calculateScrollProgress,
  estimateNextOffset
} from './worklets';
import { round } from 'react-native-redash';
import { getStartOfEveryMonth } from './utils';
import { CalendarMonthWithContext } from './components/calendarMonth/CalendarMonthWithContext';
import type { CalendarDate, CalendarYearAndMonth, EnumType } from './types';
import type { CalendarProps } from './Calendar';
import type { CalendarDayKind } from './CalendarDay';
import { CalendarMonthFallback } from './components/calendarMonth';
import type {
  CalendarMonthChange,
  CalendarMonthItem
} from './hooks/useCalendarMonths';

const MonthKind = {
  FULL_MONTH: 'FULL_MONTH',
  FALLBACK_MONTH: 'FALLBACK_MONTH'
} as const;

type MonthKind = EnumType<typeof MonthKind>;

type MonthItem = {
  calendarYearAndMonth: CalendarYearAndMonth;
  monthKind: MonthKind;
};

type MonthItemList = MonthItem[];
type MonthFlatList = FlatListProps<MonthItem>;
type MonthRenderItem = NonNullable<MonthFlatList['renderItem']>;
type MonthKeyExtractor = NonNullable<MonthFlatList['keyExtractor']>;
type MonthItemLayout = NonNullable<MonthFlatList['getItemLayout']>;
type MonthOnViewableItemsChanged = NonNullable<
  MonthFlatList['onViewableItemsChanged']
>;

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList
) as React.ComponentClass<Animated.AnimateProps<ViewStyle, MonthFlatList>, any>;

export const usePrevious = <T,>(value: T): T | undefined => {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef<T>();

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
};

type extractGeneric<T> = T extends Animated.SharedValue<infer X> ? X : never;
// const t: extractGeneric<Animated.SharedValue<T>>

const useSharedPrevious = <T, U = extractGeneric<T>>(
  value: Animated.SharedValue<U>
): Animated.SharedValue<U> => {
  const prevValue = useSharedValue<any>(value);

  useAnimatedReaction(
    () => {
      return value.value;
    },
    (result, prev) => {
      // console.log(
      //   `result: ${JSON.stringify(result)}, prev: ${JSON.stringify(prev)}`
      // );
      if (prev === null) {
        prevValue.value = result;
      } else {
        prevValue.value = prev;
      }
    },
    []
  );
  return prevValue;
};

export interface CalendarScrollableMonthsProps {
  scrollMode: CalendarProps['scrollMode'];
  scrollModeDeceleration: FlatListProps<any>['decelerationRate'];
  initialCalendarYearAndMonth: CalendarYearAndMonth;
  activeCalendarDay: CalendarDate;
  selectedDates: CalendarDate[];
  fallbackWindowSize: number;
  renderFallbackMonth?: (yearAndMonth: CalendarYearAndMonth) => JSX.Element;
  onCalendarDayPress?: (day: CalendarDate, kind: CalendarDayKind) => void;
}

export const CalendarScrollableMonths = ({
  scrollMode,
  scrollModeDeceleration,
  initialCalendarYearAndMonth,
  fallbackWindowSize,
  renderFallbackMonth
}: CalendarScrollableMonthsProps) => {
  const blankFreeMode = useMemoOne<boolean>(() => {
    return renderFallbackMonth !== undefined;
  }, [renderFallbackMonth]);

  const scrollModeProps = useMemoOne<Partial<FlatListProps<any>>>(() => {
    if (scrollMode === 'oneMonth') {
      return {
        pagingEnabled: true
      };
    } else if (scrollMode === 'multipleMonths') {
      return {
        snapToInterval: windowWidth
      };
    } else {
      return {};
    }
  }, [scrollMode]);

  const { monthsBefore, calendarInterval } = useCalendarInternal();

  const {
    scrollHandler,
    scrollState,
    scrollContentOffset,
    scrollContentSize,
    scrollVelocity,
    scrollLayoutMeasurement
  } = useCalendarScroll();

  const {
    calendarAnimatedCommonEraMonth,
    calendarCurrentAnimatedMonthInYear,
    calendarAnimatedScrollProgress,
    calendarAnimatedMonthIndex,
    calendarStartMonthFromCommonEra,
    calendarEndMonthFromCommonEra
  } = useCalendarAnimated();

  // @ts-expect-error
  useDerivedValue(() => {
    if (scrollState.value !== ScrollState.UNDETERMINED) {
      const range: [number, number] = [
        calendarStartMonthFromCommonEra,
        calendarEndMonthFromCommonEra
      ];
      calendarAnimatedCommonEraMonth.value = round(
        interpolate(
          scrollContentOffset.value.x,
          [0, scrollContentSize.value.width - windowWidth],
          range,
          Extrapolate.CLAMP
        ),
        4
      );

      calendarCurrentAnimatedMonthInYear.value =
        calendarAnimatedCommonEraMonth.value % 12;

      calendarAnimatedScrollProgress.value = calculateScrollProgress(
        calendarAnimatedCommonEraMonth,
        range
      );

      calendarAnimatedMonthIndex.value = calculateMonthIndexProgress(
        calendarAnimatedCommonEraMonth,
        range
      );
    }
  }, [calendarStartMonthFromCommonEra, calendarEndMonthFromCommonEra]);

  // useDerivedValue(() => {
  //   console.log(
  //     `calendarAnimatedCommonEraMonth: ${calendarAnimatedCommonEraMonth.value}`
  //   );
  // }, []);

  // useDerivedValue(() => {
  //   //console.log(`scrollVelocity: ${JSON.stringify(scrollVelocity.value)}`);
  //   console.log(`scrollVelocity: ${scrollVelocity.value.x}`);
  // }, []);

  // const functionRun = (value: number) => {
  //   return PixelRatio.roundToNearestPixel(value);
  // };
  // console.log(`PixelRation get: ${PixelRatio.get()}`);

  // const nextOffset = useSharedValue(0, false);
  // const previousOffset = useSharedValue(0, false);
  // let previousOffset = 0;

  // const prevScrollContentOffset = useSharedPrevious(scrollContentOffset);
  // const prevScrollVelocity = useSharedPrevious(scrollVelocity);
  // const prevScrollState = useSharedPrevious(scrollState);
  // const sharedArr = useSharedValue<number[]>([]);
  // const accurateScrollVelocity = useSharedValue<number>(0);

  // useDerivedValue(() => {}, []);

  // useDerivedValue(() => {
  //   //console.log(`scrollVelocity: ${JSON.stringify(scrollVelocity.value)}`);
  //   // console.log(
  //   //   `scrollContentOffset: ${scrollContentOffset.value.x}, layoutMeasurement: ${scrollLayoutMeasurement.value.width}`
  //   // );
  //   // console.log(
  //   //   `scrollContentOffset: ${scrollContentOffset.value.x}, scrollContentSize: ${scrollContentSize.value.width}`
  //   // );
  //   // const monthOffset = round(
  //   //   scrollContentOffset.value.x % scrollLayoutMeasurement.value.width,
  //   //   2
  //   // );
  //   // console.log(`month offset: ${res}`);
  //   // console.log(
  //   //   `prevScrollContentOffset: ${JSON.stringify(prevScrollContentOffset)}`
  //   // );
  //   const velocity = scrollVelocity.value.x;
  //   const offset = scrollContentOffset.value.x;

  //   const prevVelocity = prevScrollVelocity.value.x;
  //   const prevOffset = prevScrollContentOffset.value.x;
  //   const expectOffset = estimateNextOffset(prevVelocity, prevOffset);
  //   // nextOffset.value = estimateNextOffset(velocity, offset);
  //   const error = offset - expectOffset;
  //   // console.log(
  //   //   `current offset: ${offset}, previous offset: ${prevOffset}`
  //   // );
  //   console.log(
  //     `state: ${scrollState.value}, velocity: ${velocity}, offset: ${offset}, expected offset: ${expectOffset}, offset error: ${error}`
  //   );
  //   sharedArr.value.push(error);
  //   // previousOffset.value = offset;
  //   // previousOffset = offset;
  //   // console.log(
  //   //   `velocity: ${scrollVelocity.value.x}, monthOffset: ${monthOffset}`
  //   // );
  // }, []);

  const accurateVelocity = useSharedValue<number>(0);

  useAnimatedReaction(
    () => {
      // console.log(
      //   `react 1 called: state: ${scrollState.value}, prev state: ${prevScrollState.value}`
      // );
      // if (
      //   // prevScrollState.value === ScrollState.DRAG_BEGIN ||
      //   // prevScrollState.value === ScrollState.MOMENTUM_BEGIN ||
      //   scrollState.value === ScrollState.DRAG_BEGIN ||
      //   scrollState.value === ScrollState.MOMENTUM_BEGIN
      // ) {
      //   return velocityX.value;
      // } else {
      //   return scrollVelocity.value.x;
      // }
      return { velocity: scrollVelocity.value.x, state: scrollState.value };
    },
    (state, prev) => {
      // console.log(
      //   `state: ${JSON.stringify(state)}, prev: ${JSON.stringify(prev)}`
      // );
      // if (
      //   prev?.state === ScrollState.DRAG_BEGIN ||
      //   prev?.state === ScrollState.MOMENTUM_BEGIN ||
      //   state.state === ScrollState.DRAG_BEGIN ||
      //   state.state === ScrollState.MOMENTUM_BEGIN ||
      //   state.state === ScrollState.DRAG_END
      // ) {
      //   return;
      // }

      if (
        (state.state !== ScrollState.ON_SCROLL &&
          state.state !== ScrollState.MOMENTUM_END) ||
        prev?.state !== ScrollState.ON_SCROLL
      ) {
        return;
      }

      accurateVelocity.value = state.velocity;

      // console.log(`state: ${state.state}, velocity: ${state.velocity}`);
      // console.log(`react 2 called: accurateVelocity: ${accurateVelocity}`);
    },
    []
  );

  // useDerivedValue(() => {
  //   // console.log(`accurate velocity: ${accurateVelocity.value}`);
  //   /**
  //    * If previous state was ScrollState.DRAG_BEGIN
  //    * or ScrollState.MOMENTUM_BEGIN
  //    * velocity measurements might be inaccurate
  //    */
  //   // if (
  //   //   prevScrollState.value === ScrollState.DRAG_BEGIN ||
  //   //   prevScrollState.value === ScrollState.MOMENTUM_BEGIN ||
  //   //   scrollState.value === ScrollState.DRAG_BEGIN ||
  //   //   scrollState.value === ScrollState.MOMENTUM_BEGIN
  //   // ) {
  //   // } else {
  //   //   console.log(
  //   //     `state: ${scrollState.value}, velocity: ${scrollVelocity.value.x}`
  //   //   );
  //   // }
  //   // accurateScrollVelocity.value = scrollVelocity.value.x;
  //   /**
  //    * If current state is ScrollState.DRAG_BEGIN
  //    * or ScrollState.MOMENTUM_BEGIN
  //    * velocity measurements might be inaccurate
  //    */
  //   // if (
  //   //   scrollState.value === ScrollState.DRAG_BEGIN ||
  //   //   scrollState.value === ScrollState.MOMENTUM_BEGIN
  //   // ) {
  //   //   return;
  //   // }
  //   // Filter out unreliable velocity measurements
  //   // if (
  //   //   scrollState.value === ScrollState.DRAG_END ||
  //   //   scrollState.value === ScrollState.MOMENTUM_BEGIN
  //   // ) {
  //   //   return;
  //   // }
  //   // console.log(
  //   //   `state: ${scrollState.value}, velocity: ${scrollVelocity.value.x}`
  //   // );
  // }, []);

  // useDerivedValue(() => {
  //   scrollContentOffset.value;
  //   const sorted = sharedArr.value
  //     .sort((a, b) => -1 * (Math.abs(a) - Math.abs(b)))
  //     .map(Math.abs);
  //   // console.log(`max errors: ${sorted}`);
  //   console.log(`max errors: ${sorted.slice(0, 10)}`);
  // }, []);
  // useDerivedValue(() => {
  //   console.log(`calendarMonthIndex: ${calendarAnimatedMonthIndex.value}`);
  // }, []);

  // const calendarMonths = useMemoOne<MonthItemList>(() => {
  //   const calendarYearAndMonths = getStartOfEveryMonth(
  //     calendarInterval
  //   ).map<CalendarYearAndMonth>((dt) => {
  //     return {
  //       year: dt.year,
  //       month: dt.month
  //     };
  //   });

  //   if (blankFreeMode) {
  //     // All months are fallback, except initial month
  //     return calendarYearAndMonths.map((it) => {
  //       const monthKind = isCalendarYearAndMonthEqual(
  //         it,
  //         initialCalendarYearAndMonth
  //       )
  //         ? MonthKind.FULL_MONTH
  //         : MonthKind.FALLBACK_MONTH;
  //       return {
  //         calendarYearAndMonth: it,
  //         monthKind: MonthKind.FALLBACK_MONTH
  //       };
  //     });
  //   } else {
  //     return calendarYearAndMonths.map((it) => ({
  //       calendarYearAndMonth: it,
  //       monthKind: MonthKind.FULL_MONTH
  //     }));
  //   }
  // }, [calendarInterval, initialCalendarYearAndMonth, blankFreeMode]);

  console.log(`CalendarScrollableMonths: render!`);

  const [calendarMonths, updateCalendarMonths] = useCalendarMonths(
    calendarInterval,
    initialCalendarYearAndMonth,
    blankFreeMode
  );

  const renderItem = useCallbackOne<MonthRenderItem>(({ item }) => {
    // console.log(`renderItem: ${JSON.stringify(item)}`);
    switch (item.monthKind) {
      case MonthKind.FULL_MONTH:
        return (
          <CalendarMonthWithContext
            calendarYearAndMonth={item.calendarYearAndMonth}
          />
        );
      case MonthKind.FALLBACK_MONTH:
        return (
          <CalendarMonthFallback
            calendarYearAndMonth={item.calendarYearAndMonth}
          />
        );
    }
  }, []);

  const keyExtractor = useCallbackOne<MonthKeyExtractor>((item) => {
    return getIdFromCalendarYearAndMonth(item.calendarYearAndMonth);
  }, []);

  const getItemLayout = useCallbackOne<MonthItemLayout>((_, index) => {
    return {
      length: windowWidth,
      offset: windowWidth * index,
      index
    };
  }, []);

  // useAnimatedReaction(
  //   () => {
  //     return Math.round(calendarAnimatedMonthIndex.value);
  //   },
  //   (currentMonth, prevMonth) => {
  //     if (currentMonth === prevMonth) {
  //       return;
  //     }
  //     console.log(
  //       `velocity: ${accurateVelocity.value}, currentMonth: ${currentMonth}, prevMonth: ${prevMonth}`
  //     );
  //     // console.log(
  //     //   `onViewableItemsChanged: viewableItems: ${
  //     //     calendarAnimatedMonthIndex.value
  //     //   } changed: ${JSON.stringify(viewableItems, null, 2)}`
  //     // );
  //     // const startIndex = Math.min(0, currentMonthIndex - fallbackWindowSize);
  //     // const removeIndex = Math.max(
  //     //   calendarEndMonthFromCommonEra - calendarStartMonthFromCommonEra,
  //     //   currentMonthIndex + fallbackWindowSize
  //     // );

  //     const range = [
  //       Math.max(0, currentMonth - fallbackWindowSize),
  //       Math.min(
  //         calendarEndMonthFromCommonEra - calendarStartMonthFromCommonEra,
  //         currentMonth + fallbackWindowSize
  //       )
  //     ] as const;

  //     const calendarSize =
  //       calendarEndMonthFromCommonEra - calendarStartMonthFromCommonEra + 1;

  //     const array: CalendarMonthChange[] = Array(calendarSize);
  //     for (let i = 0; i < calendarSize; ++i) {
  //       if (i >= range[0] && i <= range[1]) {
  //         array[i] = { index: i, monthKind: MonthKind.FULL_MONTH };
  //       } else {
  //         array[i] = { index: i, monthKind: MonthKind.FALLBACK_MONTH };
  //       }
  //     }

  //     runOnJS(updateCalendarMonths)(array);

  //     // updateCalendarMonths(array);

  //     // const updatedCalendarMonths = Array.from(
  //     //   { length: calendarSize },
  //     //   (_, index) => {
  //     //     console.log(
  //     //       `index: ${index}, currentIndex: ${currentMonthIndex}, range: ${JSON.stringify(
  //     //         range
  //     //       )}`
  //     //     );
  //     //     if (isIndexInRangeInclusive(index, range)) {
  //     //       return { index: index, monthKind: MonthKind.FULL_MONTH };
  //     //     } else {
  //     //       return { index: index, monthKind: MonthKind.FALLBACK_MONTH };
  //     //     }
  //     //   }
  //     // );
  //     // console.log(`calendarSize: ${calendarSize}`);
  //     // console.log(
  //     //   `updatedCalendrMonths: ${JSON.stringify(
  //     //     updatedCalendarMonths,
  //     //     null,
  //     //     2
  //     //   )}`
  //     // );
  //     // Array(endMonthIndex - firstMonthIndex + 1).map<CalendarMonthChange>((_, index) => ({index: firstMonthIndex + index, monthKind: MonthKind.FULL_MONTH}))
  //     // Array.from<number>(
  //     //   { length: endMonthIndex - firstMonthIndex + 1 },
  //     //   (x, i) => x
  //     // );
  //     // const calendarMonthChanges: CalendarMonthChange = changed.map<CalendarMonthChange>((it) => {
  //     //   return {index: it.index, monthKind: it. }
  //     // });
  //     // changed.map((it) => {});
  //   },
  //   [fallbackWindowSize, updateCalendarMonths]
  // );

  const onViewableItemsChanged = useCallbackOne<MonthOnViewableItemsChanged>(
    ({ viewableItems }) => {
      console.log(
        `onViewableItemsChanged: viewableItems: ${
          calendarAnimatedMonthIndex.value
        } changed: ${JSON.stringify(viewableItems, null, 2)}`
      );
      const currentMonthIndex = Math.round(calendarAnimatedMonthIndex.value);
      // const startIndex = Math.min(0, currentMonthIndex - fallbackWindowSize);
      // const removeIndex = Math.max(
      //   calendarEndMonthFromCommonEra - calendarStartMonthFromCommonEra,
      //   currentMonthIndex + fallbackWindowSize
      // );

      const range = [
        Math.max(0, currentMonthIndex - fallbackWindowSize),
        Math.min(
          calendarEndMonthFromCommonEra - calendarStartMonthFromCommonEra,
          currentMonthIndex + fallbackWindowSize
        )
      ] as const;

      const calendarSize =
        calendarEndMonthFromCommonEra - calendarStartMonthFromCommonEra + 1;

      const array: CalendarMonthChange[] = Array(calendarSize);
      for (let i = 0; i < calendarSize; ++i) {
        if (i >= range[0] && i <= range[1]) {
          array[i] = { index: i, monthKind: MonthKind.FULL_MONTH };
        } else {
          array[i] = { index: i, monthKind: MonthKind.FALLBACK_MONTH };
        }
      }

      updateCalendarMonths(array);

      // const updatedCalendarMonths = Array.from(
      //   { length: calendarSize },
      //   (_, index) => {
      //     console.log(
      //       `index: ${index}, currentIndex: ${currentMonthIndex}, range: ${JSON.stringify(
      //         range
      //       )}`
      //     );
      //     if (isIndexInRangeInclusive(index, range)) {
      //       return { index: index, monthKind: MonthKind.FULL_MONTH };
      //     } else {
      //       return { index: index, monthKind: MonthKind.FALLBACK_MONTH };
      //     }
      //   }
      // );
      // console.log(`calendarSize: ${calendarSize}`);
      // console.log(
      //   `updatedCalendrMonths: ${JSON.stringify(
      //     updatedCalendarMonths,
      //     null,
      //     2
      //   )}`
      // );
      // Array(endMonthIndex - firstMonthIndex + 1).map<CalendarMonthChange>((_, index) => ({index: firstMonthIndex + index, monthKind: MonthKind.FULL_MONTH}))
      // Array.from<number>(
      //   { length: endMonthIndex - firstMonthIndex + 1 },
      //   (x, i) => x
      // );
      // const calendarMonthChanges: CalendarMonthChange = changed.map<CalendarMonthChange>((it) => {
      //   return {index: it.index, monthKind: it. }
      // });
      // changed.map((it) => {});
    },
    [fallbackWindowSize, updateCalendarMonths]
  );

  return (
    <AnimatedFlatList
      data={calendarMonths}
      initialScrollIndex={monthsBefore}
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={1}
      decelerationRate={scrollModeDeceleration}
      maxToRenderPerBatch={1}
      // maxToRenderPerBatch={1}
      // windowSize={3}
      // windowSize={100}
      // updateCellsBatchingPeriod={}
      onScroll={scrollHandler}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={ViewabilityConfig}
      {...scrollModeProps}
    />
  );
};
