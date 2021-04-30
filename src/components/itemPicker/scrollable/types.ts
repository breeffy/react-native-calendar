import type {
  FlatListProps,
  ScrollViewProps,
  StyleProp,
  ViewStyle
} from 'react-native';
import type { useAnimatedScrollHandler } from 'react-native-reanimated';
import type { Intersection } from 'utility-types';
import type { AnimatedScrollView } from './ScrollableView';
import type { AnimatedFlatList } from './ScrollableFlatList';

type CommonProps<T> = Intersection<ScrollViewProps, FlatListProps<T>>;

// performanceProps: Pick<
//   FlatListProps<any>,
//   | 'initialNumToRender'
//   | 'windowSize'
//   | 'maxToRenderPerBatch'
//   | 'scrollEventThrottle'
// >;

export interface ScrollableCommon<T> {
  items: T[];
  disableIntervalMomentum: CommonProps<T>['disableIntervalMomentum'];
  snapToInterval: CommonProps<T>['snapToInterval'];
  scrollEventThrottle: CommonProps<T>['scrollEventThrottle'];
  horizontal: boolean;
  showsHorizontalScrollIndicator: boolean;
  decelerationRate: CommonProps<T>['decelerationRate'];
  contentOffset?: CommonProps<T>['contentOffset'];
  headerComponentStyle?: ViewStyle;
  footerComponentStyle?: ViewStyle;
  // renderItem: (props: PickerItemProps) => JSX.Element;
  renderItem: (item: T, index: number) => JSX.Element;
  onScroll: ReturnType<typeof useAnimatedScrollHandler>;
}

// export type ScrollableRef = React.Ref<ScrollView & FlatList<any>>;
export type ScrollableViewRef = React.Ref<typeof AnimatedScrollView>;
export type ScrollableFlatListRef = React.Ref<typeof AnimatedFlatList>;
