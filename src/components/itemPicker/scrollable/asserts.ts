import type { ItemPickerScrollComponentKind } from '../../../pickers/ItemPicker';

export function isFlatListComponent<T, U extends ItemPickerScrollComponentKind>(
  kind: U
): kind is T extends U ? T : never {
  return kind === 'flatlist';
}
// export function isFlatListComponent(
//   kind: ItemPickerScrollComponentKind
// ): kind is 'flatlist' {
//   return kind === 'flatlist';
// }
