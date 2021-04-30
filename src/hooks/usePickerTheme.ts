import { useContext } from 'react';
import { PickerThemeContext } from '../contexts/pickerTheme';

export const usePickerTheme = () => {
  return useContext(PickerThemeContext);
};
