import { range } from '../../utils';

const PickerSeconds = range(0, 60);
const PickerMinutes = range(0, 60);
const PickerHours = range(0, 24);
const PickerDays = range(0, 366);
const PickerDaysInLeapYear = range(0, 366, true);

export const PickerKind = Object.freeze({
  Seconds: PickerSeconds,
  Minutes: PickerMinutes,
  Hours: PickerHours,
  Days: PickerDays,
  DaysInLeapYear: PickerDaysInLeapYear
});
