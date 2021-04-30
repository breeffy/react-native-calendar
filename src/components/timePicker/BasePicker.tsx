import React, { forwardRef, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatListProps,
  PixelRatio,
  NativeSyntheticEvent
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { DateTime } from 'luxon';
import { useCallbackOne, useMemoOne } from 'use-memo-one';
import { CalendarProvider } from '../../contexts/external';
import { CalendarInternalProvider } from '../../contexts/internal';
import { CalendarAnimatedProvider } from '../../contexts/animated';
import { CalendarDaysOfWeekHeader } from '..';
import { calendarYearAndMonthToMonths } from '../../helpers';
import { BasePickerScrollable } from './BasePickerScrollable';
import {
  calculatePickerScrollProgress,
  calculateScrollProgress
} from '../../worklets';
import { CalendarHeaderMonth } from '../header/CalendarHeaderMonth';
import { useCalendarInterval, useSelectedDates } from '../../hooks';
import { CalendarHeaderYear } from '../header/CalendarHeaderYear';
import { CalendarHeaderDecorator } from '../header/CalendarHeaderDecorator';
import { CalendarDayKind } from '../../CalendarDay';
import { PickerAnimatedProvider } from '../../contexts/pickerAnimated';
import type { PickerAnimatedContextInterface } from '../../contexts/pickerAnimated';
import type {
  CalendarCurrentAnimatedMonthFromCommonEra,
  CalendarStartMonthFromCommonEra,
  CalendarEndMonthFromCommonEra,
  CalendarDate,
  CalendarKind,
  CalendarMethods,
  CalendarYearAndMonth,
  ViewStyleProp,
  CalendarSelectionMode,
  CalendarTheme,
  CalendarPerformanceProps
} from '../../types';
import { CalendarThemeLight } from '../../themes';
import { CalendarThemeProvider } from '../../contexts/theme';
import {
  PickerConstants,
  ScrollState,
  windowHeight,
  windowWidth
} from '../../constants';
import { PickerThemeProvider } from '../../contexts/pickerTheme';
import { PickerThemeLight } from '../../themes';
import type { PickerTheme } from '../../types/pickerTheme';
import { PickerKind } from './PickerKind';
import {
  PickerInternalContextInterface,
  PickerInternalProvider
} from '../../contexts/pickerInternal';
import {
  calculateCellLayout,
  getCellSize,
  getPickerInterpolateConfig,
  range
} from '../../utils';
import type { PickerItemProps } from './types';

// @ts-expect-error
const AnimatedTapGestureHandler: typeof TapGestureHandler = Animated.createAnimatedComponent(
  // @ts-ignore
  TapGestureHandler
);

export type BasePickerProps = {
  /**
   * Values which will be shown in Picker.
   * You can provide custom values, or use
   * some of predefined from `PickerKind`.
   * If not provided, `PickerKind.Hours` will be used by default.
   */
  items?: number[];

  /**
   * Initial value to be selected.
   * If not provided, `start` will be selected by default.
   */
  initialIndex?: number;

  /**
   * Shows how much maximum of  elements can be seen simultaneously.
   *
   * If value is not provided, this setting is ignored.
   *
   * If provided, it take precedence over `cellWidth` and `cellHeight` settings.
   */
  maxVisibleValues?: number;

  /**
   * Show horizontal or vertical picker.
   * @defaultValue `horizontal`
   */
  mode?: 'horizontal' | 'vertical';

  /**
   * How much values can be scrolled over.
   * @defaultValue `oneValue`
   */
  scrollMode?: 'oneValue' | 'multipleValues' | 'anyOffset';

  /**
   * How quickly scrolling decelerates after the user lifts their finger.
   * @defaultValue `normal`
   */
  scrollModeDeceleration?: FlatListProps<any>['decelerationRate'];

  /**
   * Theme object to customize calendar appearance
   */
  theme?: PickerTheme;

  /**
   * Properties to customize performance characteristics
   */
  performanceProps?: CalendarPerformanceProps;

  /**
   * Currently selected value
   */
  currentValue?: Animated.SharedValue<number>;

  /**
   * Current scroll progress
   */
  currentProgress?: Animated.SharedValue<number>;

  /**
   * Current index
   */
  currentIndex?: Animated.SharedValue<number>;

  /**
   * Width of the picker. Used if `horizontal` is set to `true`.
   */
  containerWidth?: number;
  containerHeight?: number;
  cellWidth?: number;
  cellHeight?: number;

  /**
   * current scroll state
   */
  state?: Animated.SharedValue<ScrollState>;

  renderItem?: (props: PickerItemProps) => JSX.Element;
} & ViewStyleProp;

export const BasePicker = forwardRef<CalendarMethods, BasePickerProps>(
  (
    {
      //values = PickerKind.Hours,
      currentValue: _currentValue,
      currentProgress: _currentProgress,
      currentIndex: _currentIndex,
      items: values = range(0, 10),
      initialIndex = 0,
      maxVisibleValues,
      // scrollMode = 'oneValue',
      mode = 'horizontal',
      scrollMode = 'anyOffset',
      scrollModeDeceleration = 'normal',
      theme = PickerThemeLight,
      performanceProps,
      containerWidth = windowWidth,
      containerHeight = windowHeight,
      cellWidth: _cellWidth = PickerConstants.ValueWidth,
      cellHeight: _cellHeight = PickerConstants.ValueHeight,
      style: _containerStyle,
      renderItem
    }: BasePickerProps,
    ref
  ) => {
    const [cellSize, cellLayout] = useMemoOne(() => {
      return calculateCellLayout(
        mode,
        maxVisibleValues,
        containerWidth,
        containerHeight,
        _cellWidth,
        _cellHeight
      );
    }, [
      mode,
      maxVisibleValues,
      containerWidth,
      containerHeight,
      _cellWidth,
      _cellHeight
    ]);

    const valueInterpolateConfig = useMemoOne(() => {
      return getPickerInterpolateConfig(values, cellSize);
    }, [values, cellSize]);

    const initialValue = useMemoOne(() => {
      return values[initialIndex];
    }, [values, initialIndex]);

    const currentValue = useSharedValue(initialValue);

    const initialProgress = useMemoOne(() => {
      return (runOnJS(calculatePickerScrollProgress)(
        currentValue.value,
        valueInterpolateConfig
      ) as unknown) as number;
    }, [valueInterpolateConfig]);

    const currentProgress = useSharedValue(initialProgress);

    const indexInterpolateConfig = useMemoOne(() => {
      const indexes = [...values.keys()];
      return getPickerInterpolateConfig(indexes, cellSize);
    }, [values, cellSize]);

    console.log(
      `index interpolate config: ${JSON.stringify(indexInterpolateConfig)}`
    );

    const currentIndex = useSharedValue(initialIndex);

    const animatedContextVariables = useMemo<PickerAnimatedContextInterface>(
      () => ({
        currentValue: currentValue,
        currentProgress: currentProgress,
        currentIndex: currentIndex,
        values: values,
        initialIndex: initialIndex
      }),
      [currentValue, currentProgress, currentIndex, values, initialIndex]
    );

    const contentWrapperRef = useRef<typeof AnimatedTapGestureHandler>(null);

    const internalContextVariables = useMemo<PickerInternalContextInterface>(
      () => ({
        mode,
        itemsLength: values.length,
        containerWidth,
        containerHeight,
        cellWidth: cellLayout.width,
        cellHeight: cellLayout.height,
        interpolateConfigs: {
          value: valueInterpolateConfig,
          index: indexInterpolateConfig
        }
      }),
      [
        mode,
        values.length,
        containerWidth,
        containerHeight,
        cellLayout,
        valueInterpolateConfig,
        indexInterpolateConfig
      ]
    );

    // const externalContextVariables = useMemo<CalendarMethods>(
    //   () => ({
    //     select: selectDate,
    //     deselect: deselectDate
    //   }),
    //   [selectDate, deselectDate]
    // );

    const [calendarHeader] = useState(40);

    useAnimatedReaction(
      () => {
        return [currentValue.value, currentProgress.value, currentIndex.value];
      },
      (array) => {
        if (_currentValue !== undefined) {
          _currentValue.value = array[0];
        }
        // if (_currentProgress !== undefined) {
        //   _currentProgress.value = array[1];
        // }
        if (_currentIndex !== undefined) {
          _currentIndex.value = array[2];
        }
      },
      []
    );

    return (
      <View style={theme.sheet}>
        <PickerThemeProvider value={theme}>
          {/* <CalendarProvider value={externalContextVariables}> */}
          <PickerInternalProvider value={internalContextVariables}>
            <PickerAnimatedProvider value={animatedContextVariables}>
              {/* <PickerAnimatedProvider value={contextVariables}> */}
              {/* <CalendarHeaderDecorator style={styles.headerDecoratorStyle}>
                <CalendarHeaderMonth
                  style={styles.headerMonthStyle}
                  height={calendarHeader}
                />
                <CalendarHeaderYear height={calendarHeader} />
              </CalendarHeaderDecorator>

              <CalendarDaysOfWeekHeader /> */}
              <BasePickerScrollable
                ref={ref}
                scrollMode={scrollMode}
                scrollModeDeceleration={scrollModeDeceleration}
                performanceProps={performanceProps}
                renderItem={renderItem}
              />
            </PickerAnimatedProvider>
          </PickerInternalProvider>
          {/* </PickerAnimatedProvider> */}
          {/* </CalendarProvider> */}
        </PickerThemeProvider>
      </View>
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
