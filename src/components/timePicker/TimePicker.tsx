import React from 'react';
import type { ComponentProps } from 'react';
import { BasePicker } from './BasePicker';

export const TimePicker = (props: ComponentProps<typeof BasePicker>) => {
  return <BasePicker {...props} />;
};
