import { useMemoOne } from 'use-memo-one';
import type { ItemPickerProps } from '../pickers/ItemPicker';

interface Props<T = any> {
  scrollMode: ItemPickerProps<T>['scrollMode'];
  itemSize: number;
}

export const usePagination = ({ scrollMode, itemSize }: Props) => {
  const pagination = useMemoOne(() => {
    if (scrollMode === 'oneValue') {
      return {
        disableIntervalMomentum: true,
        snapToInterval: itemSize
      };
    } else if (scrollMode === 'multipleValues') {
      return {
        disableIntervalMomentum: false,
        snapToInterval: itemSize
      };
    } else {
      return {};
    }
  }, [scrollMode, itemSize]);
  return pagination;
};
