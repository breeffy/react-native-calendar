import { createContext } from 'react';
import type { InterpolateConfig } from '../utils';

export interface ItemPickerInternalContextInterface<T> {
  mode: 'horizontal' | 'vertical';
  items: T[];
  itemsLength: number;
  maxVisibleItems?: number;
  pickerWidth: number;
  pickerHeight: number;
  pickerSize: number;
  itemWidth: number;
  itemHeight: number;
  itemSize: number;
  interpolateConfigs: {
    // value: InterpolateConfig;
    index: InterpolateConfig;
  };
}

// @ts-expect-error
export const ItemPickerInternalContext = createContext<
  ItemPickerInternalContextInterface<any>
>();
export const ItemPickerInternalProvider = ItemPickerInternalContext.Provider;
