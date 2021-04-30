import { createContext } from 'react';
import type { PickerTheme } from '../types/pickerTheme';

// @ts-expect-error
export const PickerThemeContext = createContext<PickerTheme>();
export const PickerThemeProvider = PickerThemeContext.Provider;
