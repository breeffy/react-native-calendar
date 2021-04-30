import { useContext } from 'react';
import { PickerAnimatedContext } from '../contexts/pickerAnimated';

export const usePickerAnimated = () => {
  return useContext(PickerAnimatedContext);
};
