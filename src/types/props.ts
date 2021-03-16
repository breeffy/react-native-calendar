import type { StyleProp, ViewStyle } from 'react-native';

export type ViewStyleProp = StyleProp<ViewStyle>;
export type WithStyleProp<P> = {
  style?: StyleProp<P>;
};

export type WithViewStyleProp = WithStyleProp<ViewStyle>;
