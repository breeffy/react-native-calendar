import React from 'react';
import type { ComponentProps } from 'react';
import { ItemPicker } from '../../pickers/ItemPicker';

export const TimePicker = (props: ComponentProps<typeof ItemPicker>) => {
  return <ItemPicker {...props} />;
};
