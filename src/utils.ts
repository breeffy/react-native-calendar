import { DateTime } from 'luxon';
import Animated, { Extrapolate } from 'react-native-reanimated';
import type { Interval } from 'luxon';
import { PixelRatio } from 'react-native';

/** At least two numbers are required for interpolation */
export type InterpolateNumbers = [number, ...number[], number];
export type InterpolateInput = InterpolateNumbers;
export type InterpolateOutput = InterpolateNumbers;

export type InterpolateConfig = [
  input: InterpolateInput,
  output: InterpolateOutput,
  type?: Animated.Extrapolate | undefined
];

export type CellLayout = {
  width: number;
  height: number;
};

function isInterpolateNumbers(array: number[]): array is InterpolateNumbers {
  return array.length >= 2;
}

export const range = (
  start: number,
  end: number,
  inclusiveEnd: boolean | undefined = false
): number[] => {
  const size = end - start + (inclusiveEnd ? 1 : 0);
  return Array<number>(size)
    .fill(0)
    .map((_, index) => {
      return start + index;
    });
};

export const calculateCellLayout = (
  mode: 'horizontal' | 'vertical',
  maxVisibleValues: number | undefined,
  containerWidth: number,
  containerHeight: number,
  cellWidth: number,
  cellHeight: number
): [cellSize: number, cellLayout: CellLayout] => {
  let cellSize: number;
  let cellLayout: CellLayout;

  if (maxVisibleValues !== undefined) {
    if (mode === 'horizontal') {
      cellSize = containerWidth / maxVisibleValues;
    } else {
      cellSize = containerHeight / maxVisibleValues;
    }
  } else {
    cellSize = getCellSize(mode, cellWidth, cellHeight);
  }

  cellSize = PixelRatio.roundToNearestPixel(cellSize);

  if (mode === 'horizontal') {
    cellHeight = PixelRatio.roundToNearestPixel(cellHeight);
    cellLayout = {
      width: cellSize,
      height: cellHeight
    };
  } else {
    cellWidth = PixelRatio.roundToNearestPixel(cellWidth);
    cellLayout = {
      width: cellWidth,
      height: cellSize
    };
  }
  return [cellSize, cellLayout];
};

export const stackItemLayout = (
  mode: 'horizontal' | 'vertical',
  maxVisibleValues: number | undefined,
  containerWidth: number,
  containerHeight: number,
  cellWidth: number,
  cellHeight: number
): [cellSize: number, cellLayout: CellLayout] => {
  let cellSize: number;
  let cellLayout: CellLayout;

  if (maxVisibleValues !== undefined) {
    if (mode === 'horizontal') {
      cellSize = containerWidth / maxVisibleValues;
    } else {
      cellSize = containerHeight / maxVisibleValues;
    }
  } else {
    cellSize = getCellSize(mode, cellWidth, cellHeight);
  }

  cellSize = PixelRatio.roundToNearestPixel(cellSize);

  if (mode === 'horizontal') {
    cellHeight = PixelRatio.roundToNearestPixel(cellHeight);
    cellLayout = {
      width: cellSize,
      height: cellHeight
    };
  } else {
    cellWidth = PixelRatio.roundToNearestPixel(cellWidth);
    cellLayout = {
      width: cellWidth,
      height: cellSize
    };
  }
  return [cellSize, cellLayout];
};

export const getCellSize = (
  mode: 'horizontal' | 'vertical',
  cellWidth: number,
  cellHeight: number
) => {
  return mode === 'horizontal' ? cellWidth : cellHeight;
};

export const getScrollableIndexInterpolateConfig = (
  values: number[],
  cellSize: number
): InterpolateConfig => {
  const start = 0;
  const end = values.length;

  const input: number[] = [];
  const output: number[] = [];
  const type = Extrapolate.CLAMP;

  for (let i = start; i < end; ++i) {
    input.push(i * cellSize);
    output.push(values[i]);
  }

  if (input.length === output.length) {
    if (isInterpolateNumbers(input) && isInterpolateNumbers(output)) {
      return [input, output, type];
    }
  }

  throw new Error(
    `failed to calculate picker interpolation config: input [${JSON.stringify(
      input
    )}], output [${JSON.stringify(output)}], type [${type}]`
  );
};

export const getPickerInterpolateConfig = (
  values: number[],
  cellSize: number
): InterpolateConfig => {
  const start = 0;
  const end = values.length;

  const input: number[] = [];
  const output: number[] = [];
  const type = Extrapolate.CLAMP;

  for (let i = start; i < end; ++i) {
    input.push(i * cellSize);
    output.push(values[i]);
  }

  if (input.length === output.length) {
    if (isInterpolateNumbers(input) && isInterpolateNumbers(output)) {
      return [input, output, type];
    }
  }

  throw new Error(
    `failed to calculate picker interpolation config: input [${JSON.stringify(
      input
    )}], output [${JSON.stringify(output)}], type [${type}]`
  );
};

export const getMonthInterpolateConfig = (
  start: number,
  end: number,
  height: number
): InterpolateConfig => {
  // console.log(
  //   `getMonthInterpolateConfig: ${JSON.stringify({ start, end, height })}`
  // );
  const input: InterpolateInput = [start, end];
  const output: InterpolateOutput = [0, height * (end - start)];
  return [input, output, Extrapolate.CLAMP];
};

export const getYearInterpolateConfig = (
  start: number,
  end: number,
  height: number
): InterpolateConfig => {
  const input: number[] = [];
  const output: number[] = [];
  const type = Extrapolate.CLAMP;

  let currentOffsetY = 0;
  let prevIsDecember = false;
  for (let i = start; i <= end; ++i) {
    const isDecember = i % 12 === 0;

    if (i === start) {
      // Always add zero offset for first month
      input.push(i);
      output.push(0);
    }

    if (isDecember || i === end) {
      input.push(i);
      output.push(currentOffsetY);
      prevIsDecember = true;
    } else if (prevIsDecember) {
      currentOffsetY += height;
      input.push(i);
      output.push(currentOffsetY);
      prevIsDecember = false;
    }
  }

  if (input.length === output.length) {
    if (isInterpolateNumbers(input) && isInterpolateNumbers(output)) {
      return [input, output, type];
    }
  }

  throw new Error(
    `failed to calculate month interpolation config: input [${JSON.stringify(
      input
    )}], output [${JSON.stringify(output)}], type [${type}]`
  );
};

export const getStartOfEveryMonth = (
  calendarInterval: Interval
): DateTime[] => {
  return calendarInterval
    .splitBy({ month: 1 })
    .map((monthInterval) => monthInterval.start);
};

export const getUniqueYearsInInterval = (
  calendarInterval: Interval
): DateTime[] => {
  const uniqueYears = getStartOfEveryMonth(calendarInterval).map(
    (dt) => dt.year
  );
  return Array.from(new Set(uniqueYears)).map((year) => {
    return DateTime.fromObject({ year });
  });
};
