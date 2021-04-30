import { useMemoOne } from 'use-memo-one';
import { getCellSize } from '../utils';

interface Props {
  mode: 'horizontal' | 'vertical';
  itemWidth: number;
  itemHeight: number;
}

export const useItemSize = ({ mode, itemWidth, itemHeight }: Props): number => {
  const size = useMemoOne(() => {
    return getCellSize(mode, itemWidth, itemHeight);
  }, [mode, itemWidth, itemHeight]);
  return size;
};
