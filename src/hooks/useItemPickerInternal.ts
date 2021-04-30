import { useContext } from 'react';
import { ItemPickerInternalContext } from '../contexts/itemPickerInternal';
import type { ItemPickerInternalContextInterface } from '../contexts/itemPickerInternal';

export const useItemPickerInternal = <T>() => {
  return useContext<ItemPickerInternalContextInterface<T>>(
    ItemPickerInternalContext
  );
};
