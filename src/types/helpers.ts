export type ChangePropertyType<T, P extends PropertyKey, V> = Omit<T, P> &
  { [S in P]: V };

export type EnumType<T extends object> = keyof T;
