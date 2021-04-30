import { windowWidth, windowHeight } from '../constants';
import { useMemoOne } from 'use-memo-one';

interface Props {
  mode: 'horizontal' | 'vertical';
  pickerSize?: number;
  itemWidth: number;
  itemHeight: number;
}

export const usePickerLayout = ({
  mode,
  pickerSize: _pickerSize,
  itemWidth,
  itemHeight
}: Props) => {
  return useMemoOne(() => {
    if (mode === 'horizontal') {
      const pickerSize = _pickerSize ?? windowWidth;
      return {
        pickerSize: pickerSize,
        pickerWidth: pickerSize,
        pickerHeight: itemHeight
      };
    } else {
      const pickerSize = _pickerSize ?? windowHeight;
      return {
        pickerSize: itemWidth,
        pickerWidth: pickerSize,
        pickerHeight: pickerSize
      };
    }
  }, [mode, _pickerSize, itemWidth, itemHeight]);
};
