import { useContext } from 'react';
import { PickerInternalContext } from '../contexts/pickerInternal';

export const usePickerInternal = () => {
  return useContext(PickerInternalContext);
};
