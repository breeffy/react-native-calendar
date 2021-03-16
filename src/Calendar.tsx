import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import { View, StyleSheet, FlatListProps } from 'react-native';
import Animated, {
  runOnJS,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { DateTime } from 'luxon';
import { useCallbackOne, useMemoOne } from 'use-memo-one';
import { CalendarProvider } from './contexts/external';
import {
  CalendarInternalContextInterface,
  CalendarInternalProvider
} from './contexts/internal';
import { CalendarAnimatedProvider } from './contexts/animated';
import { CalendarDaysOfWeekHeader } from './components';
import { calendarYearAndMonthToMonths } from './helpers';
import { CalendarScrollableMonths } from './CalendarScrollableMonths';
import {
  calculateScrollProgress,
  calculateMonthIndexProgress
} from './worklets';
import { CalendarHeaderMonth } from './components/header/CalendarHeaderMonth';
import { useCalendarInterval, useSelectedDates } from './hooks';
import { CalendarHeaderYear } from './components/header/CalendarHeaderYear';
import { CalendarHeaderDecorator } from './components/header/CalendarHeaderDecorator';
import { CalendarDayKind } from './CalendarDay';
import type { CalendarAnimatedContextInterface } from './contexts/animated';
import type {
  CalendarCurrentAnimatedMonthFromCommonEra,
  CalendarStartMonthFromCommonEra,
  CalendarEndMonthFromCommonEra,
  CalendarDate,
  CalendarKind,
  CalendarMethods,
  CalendarYearAndMonth,
  WithViewStyleProp,
  CalendarSelectionMode
} from './types';

// @ts-expect-error
const AnimatedTapGestureHandler: typeof TapGestureHandler = Animated.createAnimatedComponent(
  // @ts-ignore
  TapGestureHandler
);

export type CalendarProps = {
  /**
   * Calendar kind (type).
   * @defaultValue `gregorian`
   */
  kind?: CalendarKind;

  /**
   * Initial month to be shown.
   * If not provided, year and month of current local datetime will be selected.
   */
  initialCalendarYearAndMonth?: CalendarYearAndMonth;

  /**
   * Amount of months before initial year and month,
   * which will be shown in a calendar.
   * @defaultValue `50`
   */
  monthsBefore?: number;

  /**
   * Amount of months after initial year and month,
   * which will be shown in a calendar.
   * @defaultValue `50`
   */
  monthsAfter?: number;

  /**
   * How much days can be selected simultaneously.
   * @defaultValue `singleDay`
   */
  selectionMode?: CalendarSelectionMode;

  /**
   * How much months can be scrolled over.
   * @defaultValue `multipleMonths`
   */
  scrollMode?: 'oneMonth' | 'multipleMonths' | 'anyOffset';

  /**
   * How quickly the calendar scrolling decelerates after the user lifts their finger.
   * @defaultValue `normal`
   */
  scrollModeDeceleration?: FlatListProps<any>['decelerationRate'];

  /**
   * Active (current) calendar day.
   * If provided, will be highlighted in active color.
   */
  activeCalendarDay?: CalendarDate;

  /**
   * How much normal months will be rendered (window)
   * from left and right of currently shown month
   * in **blank-free** mode.
   *
   * @default `1`
   */
  fallbackWindowSize?: number;

  /**
   * Render fallback month when calendar is not able
   * to render full month. Fallback month should be
   * very lightweight and simple.
   * Fallback month is used to provide **blank-free scrolling**.
   */
  renderFallbackMonth?: (yearAndMonth: CalendarYearAndMonth) => JSX.Element;
  onDaySelectionChange?: (day: DateTime) => void;
} & WithViewStyleProp;

export const Calendar = forwardRef<CalendarMethods, CalendarProps>(
  (
    {
      initialCalendarYearAndMonth: _initialCalendarYearAndMonth,
      monthsBefore = 50,
      monthsAfter = 50,
      selectionMode = 'singleDay',
      scrollMode = 'multipleMonths',
      scrollModeDeceleration = 'normal',
      activeCalendarDay: _activeCalendarDay,
      fallbackWindowSize = 1,
      style,
      renderFallbackMonth
    }: CalendarProps,
    ref
  ) => {
    const [activeCalendarDay] = useMemoOne<[CalendarDate]>(() => {
      const nowTime = DateTime.local();
      return [
        _activeCalendarDay ?? {
          year: nowTime.year,
          month: nowTime.month,
          day: nowTime.day
        }
      ];
    }, [_activeCalendarDay]);

    const initialCalendarYearAndMonth = useMemoOne<CalendarYearAndMonth>(() => {
      const nowTime = DateTime.local();
      return (
        _initialCalendarYearAndMonth ?? {
          year: nowTime.year,
          month: nowTime.month
        }
      );
    }, [_initialCalendarYearAndMonth]);

    const [startCalendarYearAndMonth, endCalendarYearAndMonth] = useMemoOne<
      [CalendarYearAndMonth, CalendarYearAndMonth]
    >(() => {
      const currentYearAndMonth = DateTime.fromObject(
        initialCalendarYearAndMonth
      );
      const startDateTime = currentYearAndMonth
        .minus({ months: monthsBefore })
        .startOf('month');
      const endDateTime = currentYearAndMonth
        .plus({ months: monthsAfter })
        .startOf('month');

      const startYearAndMonth: CalendarYearAndMonth = {
        year: startDateTime.year,
        month: startDateTime.month
      };

      const endYearAndMonth: CalendarYearAndMonth = {
        year: endDateTime.year,
        month: endDateTime.month
      };
      return [startYearAndMonth, endYearAndMonth];
    }, [initialCalendarYearAndMonth, monthsBefore, monthsAfter]);

    const calendarInterval = useCalendarInterval(
      startCalendarYearAndMonth,
      endCalendarYearAndMonth
    );

    const [
      calendarStartMonthFromCommonEra,
      calendarEndMonthFromCommonEra
    ] = useMemoOne<
      readonly [CalendarStartMonthFromCommonEra, CalendarEndMonthFromCommonEra]
    >(() => {
      return [
        calendarYearAndMonthToMonths(startCalendarYearAndMonth),
        calendarYearAndMonthToMonths(endCalendarYearAndMonth)
      ] as const;
    }, [startCalendarYearAndMonth, endCalendarYearAndMonth]);

    const calendarAnimatedCommonEraMonth: CalendarCurrentAnimatedMonthFromCommonEra = useDerivedValue(() => {
      return (
        initialCalendarYearAndMonth.year * 12 +
        initialCalendarYearAndMonth.month
      );
    }, [initialCalendarYearAndMonth]);

    const calendarCurrentAnimatedMonthInYear = useDerivedValue(() => {
      return initialCalendarYearAndMonth.month;
    }, [initialCalendarYearAndMonth]);

    const calendarInitialScrollProgress = useMemoOne(() => {
      return runOnJS(calculateScrollProgress)(calendarAnimatedCommonEraMonth, [
        calendarStartMonthFromCommonEra,
        calendarEndMonthFromCommonEra
      ]);
    }, [calendarStartMonthFromCommonEra, calendarEndMonthFromCommonEra]);

    const calendarAnimatedScrollProgress = useSharedValue(
      calendarInitialScrollProgress,
      false
    );

    const calendarInitialMonthIndex = useMemoOne(() => {
      return runOnJS(
        calculateMonthIndexProgress
      )(calendarAnimatedCommonEraMonth, [
        calendarStartMonthFromCommonEra,
        calendarEndMonthFromCommonEra
      ]);
    }, [calendarStartMonthFromCommonEra, calendarEndMonthFromCommonEra]);

    const calendarAnimatedMonthIndex = useSharedValue(
      calendarInitialMonthIndex,
      false
    );

    const animatedContextVariables = useMemo<CalendarAnimatedContextInterface>(
      () => ({
        calendarAnimatedCommonEraMonth: calendarAnimatedCommonEraMonth,
        calendarCurrentAnimatedMonthInYear: calendarCurrentAnimatedMonthInYear,
        calendarAnimatedScrollProgress: calendarAnimatedScrollProgress,
        calendarStartMonthFromCommonEra: calendarStartMonthFromCommonEra,
        calendarEndMonthFromCommonEra: calendarEndMonthFromCommonEra,
        calendarAnimatedMonthIndex: calendarAnimatedMonthIndex
      }),
      [
        calendarAnimatedCommonEraMonth,
        calendarCurrentAnimatedMonthInYear,
        calendarAnimatedScrollProgress,
        calendarStartMonthFromCommonEra,
        calendarEndMonthFromCommonEra,
        calendarAnimatedMonthIndex
      ]
    );

    const [selectedDates, selectDate, deselectDate] = useSelectedDates(
      selectionMode
    );

    const onCalendarDayStateChange = useCallbackOne(
      (day: CalendarDate, calendarKind: CalendarDayKind) => {
        if (calendarKind === CalendarDayKind.SELECTED) {
          selectDate(day);
        } else if (calendarKind === CalendarDayKind.DEFAULT) {
          deselectDate(day);
        }
      },
      [selectDate, deselectDate]
    );

    useImperativeHandle(ref, () => ({
      select: selectDate,
      deselect: deselectDate
    }));

    const contentWrapperRef = useRef<typeof AnimatedTapGestureHandler>(null);

    // const contentWrapperVariables = useMemo<ContentWrapperContextInterface>(
    //   () => ({
    //     contentWrapperRef: contentWrapperRef
    //   }),
    //   [contentWrapperRef]
    // );

    const internalContextVariables = useMemo<CalendarInternalContextInterface>(
      () => ({
        activeAnimatedMonth: calendarAnimatedCommonEraMonth,
        activeCalendarDay: activeCalendarDay,
        activeCalendarYearAndMonth: initialCalendarYearAndMonth,
        selectDate: selectDate,
        deselectDate: deselectDate,
        selectedDates: selectedDates,
        monthsBefore,
        monthsAfter,
        startCalendarYearAndMonth: startCalendarYearAndMonth,
        endCalendarYearAndMonth: endCalendarYearAndMonth,
        calendarInterval: calendarInterval,
        contentWrapperRef: contentWrapperRef,
        onCalendarDayStateChange: onCalendarDayStateChange
      }),
      [
        calendarAnimatedCommonEraMonth,
        activeCalendarDay,
        initialCalendarYearAndMonth,
        selectDate,
        deselectDate,
        selectedDates,
        monthsBefore,
        monthsAfter,
        startCalendarYearAndMonth,
        endCalendarYearAndMonth,
        calendarInterval,
        contentWrapperRef,
        onCalendarDayStateChange
      ]
    );

    const externalContextVariables = useMemo<CalendarMethods>(
      () => ({
        select: selectDate,
        deselect: deselectDate
      }),
      [selectDate, deselectDate]
    );

    const [calendarHeader] = useState(40);

    return (
      <CalendarProvider value={externalContextVariables}>
        <View style={style}>
          <CalendarInternalProvider value={internalContextVariables}>
            <CalendarAnimatedProvider value={animatedContextVariables}>
              <CalendarHeaderDecorator style={styles.headerDecoratorStyle}>
                <CalendarHeaderMonth
                  style={styles.headerMonthStyle}
                  height={calendarHeader}
                />
                <CalendarHeaderYear height={calendarHeader} />
              </CalendarHeaderDecorator>

              <CalendarDaysOfWeekHeader />
              <CalendarScrollableMonths
                scrollMode={scrollMode}
                scrollModeDeceleration={scrollModeDeceleration}
                initialCalendarYearAndMonth={initialCalendarYearAndMonth}
                activeCalendarDay={activeCalendarDay}
                selectedDates={selectedDates}
                fallbackWindowSize={fallbackWindowSize}
                renderFallbackMonth={renderFallbackMonth}
                onCalendarDayPress={onCalendarDayStateChange}
              />
            </CalendarAnimatedProvider>
          </CalendarInternalProvider>
        </View>
      </CalendarProvider>
    );
  }
);

const styles = StyleSheet.create({
  headerDecoratorStyle: {
    marginBottom: 4,
    marginTop: 4
  },
  headerMonthStyle: { marginRight: 8 },
  gestureView: {
    flexGrow: 1
  }
});
