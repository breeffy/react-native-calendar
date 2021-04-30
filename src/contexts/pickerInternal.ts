import { createContext } from 'react';
import type { InterpolateConfig } from '../utils';

export interface PickerInternalContextInterface {
  mode: 'horizontal' | 'vertical';
  itemsLength: number;
  maxVisibleItems: number;
  containerWidth: number;
  containerHeight: number;
  cellWidth: number;
  cellHeight: number;
  interpolateConfigs: {
    value: InterpolateConfig;
    index: InterpolateConfig;
  };
}

// @ts-expect-error
export const PickerInternalContext = createContext<PickerInternalContextInterface>();
export const PickerInternalProvider = PickerInternalContext.Provider;
