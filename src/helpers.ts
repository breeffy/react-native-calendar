import { DateTime } from 'luxon';
import type {
  CalendarDate,
  CalendarMonth,
  CalendarWeek,
  CalendarYearAndMonth
} from './types';

export const getIdFromCalendarDate = (date: CalendarDate): string => {
  return `${date.year}-${date.month}-${date.day}`;
};

export const getCalendarDateFromId = (dateId: string): CalendarDate => {
  const splits = dateId.split('-');
  if (splits.length !== 3) {
    throw new Error(`Can't parse dateId [${dateId}] into CalendarDate`);
  }

  const numbers = splits.map((split) => {
    if (split.length === 0) {
      throw new Error(`Can't parse dateId [${dateId}] into CalendarDate`);
    }
    return Number(split);
  });

  const dt = DateTime.fromObject({
    year: numbers[0],
    month: numbers[1],
    day: numbers[2]
  });

  if (!dt.isValid) {
    throw new Error(`Can't parse dateId [${dateId}] into CalendarDate`);
  }

  return {
    year: dt.year,
    month: dt.month,
    day: dt.day
  };
};

/**
 * Finds the set of all elements in the first list not contained in the second list
 * @param first
 * @param second
 */
export const dateTimeArraysDifference = (
  first: CalendarDate[],
  second: CalendarDate[]
) => {
  return first.filter((it) => {
    for (const el of second) {
      if (isCalendarDatesEqual(it, el)) {
        continue;
      }
    }
    return true;
  });
};

export const monthContainsSomeDate = (
  month: CalendarYearAndMonth,
  dates: CalendarDate[]
): boolean => {
  for (const it of dates) {
    if (
      isCalendarYearAndMonthEqual({ year: it.year, month: it.month }, month)
    ) {
      // We unselected date from this month
      // hense month changed
      return true;
    }
  }
  return false;
};

export const calendarWeekContainsSomeDate = (
  week: CalendarWeek,
  dates: CalendarDate[]
) => {
  for (const dayOfWeek of week) {
    for (const date of dates) {
      if (isCalendarDatesEqual(dayOfWeek, date)) {
        return true;
      }
    }
  }
  return false;
};

export const getIdFromCalendarYearAndMonth = (date: CalendarYearAndMonth) => {
  return `${date.year}-${date.month}`;
};

export const dateTimeToCalendarDate = (dateTime: DateTime): CalendarDate => {
  return {
    year: dateTime.year,
    month: dateTime.month,
    day: dateTime.day
  };
};

export const dateTimeToCalendarYearAndMonth = (
  dateTime: DateTime
): CalendarYearAndMonth => {
  return {
    year: dateTime.year,
    month: dateTime.month
  };
};

export const isCalendarDatesEqual = (
  firstDate: CalendarDate,
  secondDate: CalendarDate
) => {
  if (firstDate.year === secondDate.year) {
    if (firstDate.month === secondDate.month) {
      if (firstDate.day === secondDate.day) {
        return true;
      }
    }
  }
  return false;
};

export const isCalendarYearAndMonthEqual = (
  first: CalendarYearAndMonth,
  second: CalendarYearAndMonth
) => {
  if (first.year === second.year) {
    if (first.month === second.month) {
      return true;
    }
  }
  return false;
};

export const isCalendarWeeksEqual = (
  first: CalendarWeek,
  second: CalendarWeek
) => {
  if (first.length !== second.length) {
    return false;
  }

  for (let i = 0; i < first.length; ++i) {
    if (!isCalendarDatesEqual(first[i], second[i])) {
      return false;
    }
  }
  return true;
};

export const isCalendarWeek = (
  daysRange: CalendarDate[]
): daysRange is CalendarWeek => {
  return daysRange.length === 7;
};

export const calendarYearAndMonthToMonths = (
  calendarYearAndMonth: CalendarYearAndMonth
): CalendarMonth => {
  return calendarYearAndMonth.year * 12 + calendarYearAndMonth.month;
};

export const isIndexValid = (index: number, array: any[]) => {
  return index >= 0 && index < array.length;
};

export const isIndexInRangeInclusive = (
  index: number,
  range: readonly [start: number, end: number]
) => {
  return index >= range[0] && index <= range[1];
};
