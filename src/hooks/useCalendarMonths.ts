import type { Interval } from 'luxon';
import { useState } from 'react';
import type { FlatListProps } from 'react-native';
import { getStartOfEveryMonth } from '../utils';
import { useCallbackOne, useMemoOne } from 'use-memo-one';
import { isCalendarYearAndMonthEqual, isIndexValid } from '../helpers';
import type { CalendarYearAndMonth, EnumType } from '../types';

export const MonthKind = {
  FULL_MONTH: 'FULL_MONTH',
  FALLBACK_MONTH: 'FALLBACK_MONTH'
} as const;

export type MonthKind = EnumType<typeof MonthKind>;

export type CalendarMonthItem = {
  calendarYearAndMonth: CalendarYearAndMonth;
  monthKind: MonthKind;
};

export type CalendarMonthChange = {
  index: number;
  monthKind: MonthKind;
};

type CalendarMonthItems = CalendarMonthItem[];

type ChangeCalendarMonth = (index: number, monthKind: MonthKind) => void;
type ChangeCalendarMonths = (
  calendarMonthChanges: CalendarMonthChange[]
) => void;
type MonthFlatList = FlatListProps<CalendarMonthItem>;
type MonthRenderItem = NonNullable<MonthFlatList['renderItem']>;
type MonthKeyExtractor = NonNullable<MonthFlatList['keyExtractor']>;
type MonthItemLayout = NonNullable<MonthFlatList['getItemLayout']>;
type MonthOnViewableItemsChanged = NonNullable<
  MonthFlatList['onViewableItemsChanged']
>;

const generateCalendarMonths = (
  calendarInterval: Interval,
  initialCalendarYearAndMonth: CalendarYearAndMonth,
  blankFreeMode: boolean
) => {
  const calendarYearAndMonths = getStartOfEveryMonth(
    calendarInterval
  ).map<CalendarYearAndMonth>((dt) => {
    return {
      year: dt.year,
      month: dt.month
    };
  });

  if (blankFreeMode) {
    // All months are fallback, except initial month
    return calendarYearAndMonths.map((it) => {
      const monthKind = isCalendarYearAndMonthEqual(
        it,
        initialCalendarYearAndMonth
      )
        ? MonthKind.FULL_MONTH
        : MonthKind.FALLBACK_MONTH;
      return {
        calendarYearAndMonth: it,
        monthKind: MonthKind.FALLBACK_MONTH
      };
    });
  } else {
    return calendarYearAndMonths.map((it) => ({
      calendarYearAndMonth: it,
      monthKind: MonthKind.FULL_MONTH
    }));
  }
};

export const useCalendarMonths = (
  calendarInterval: Interval,
  initialCalendarYearAndMonth: CalendarYearAndMonth,
  blankFreeMode: boolean
): [
  calendarMonths: CalendarMonthItems,
  updateCalendarMonths: ChangeCalendarMonths
] => {
  const [calendarMonths, setCalendarMonths] = useState<CalendarMonthItems>(
    () => {
      return generateCalendarMonths(
        calendarInterval,
        initialCalendarYearAndMonth,
        blankFreeMode
      );
    }
  );

  const changeCalendarMonth = useCallbackOne<ChangeCalendarMonth>(
    (index, monthKind) => {
      setCalendarMonths((prevCalendarMonths) => {
        if (!isIndexValid(index, prevCalendarMonths)) {
          throw new Error(`Index [${index}] is out of calendar bounds`);
        }
        const nextCalendarMonths = Array.from(prevCalendarMonths);
        nextCalendarMonths[index].monthKind = monthKind;
        return nextCalendarMonths;
      });
    },
    []
  );

  const changeCalendarMonths = useCallbackOne<ChangeCalendarMonths>(
    (monthChanges) => {
      setCalendarMonths((prevCalendarMonths) => {
        for (const { index, monthKind } of monthChanges) {
          if (!isIndexValid(index, prevCalendarMonths)) {
            throw new RangeError(`Index [${index}] is out of calendar bounds`);
          }
          prevCalendarMonths[index] = {
            ...prevCalendarMonths[index],
            monthKind
          };
        }
        return [...prevCalendarMonths];
      });
    },
    []
  );

  const updateCalendarMonths = useCallbackOne<ChangeCalendarMonths>(
    (monthChanges) => {
      setCalendarMonths((prevCalendarMonths) => {
        for (const { index, monthKind } of monthChanges) {
          if (!isIndexValid(index, prevCalendarMonths)) {
            throw new RangeError(`Index [${index}] is out of calendar bounds`);
          }
          prevCalendarMonths[index] = {
            ...prevCalendarMonths[index],
            monthKind
          };
        }
        return [...prevCalendarMonths];
      });
    },
    []
  );

  return [calendarMonths, updateCalendarMonths];
};
