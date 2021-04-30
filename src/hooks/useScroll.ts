import {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated';
import { ScrollState } from '../constants';
import type {
  NativeScrollPoint,
  NativeScrollSize,
  NativeScrollVelocity
} from 'react-native';
import type { ScrollView } from 'react-native';
import type { FlatList } from 'react-native-gesture-handler';

export const useScroll = <T extends ScrollView & FlatList<any>>() => {
  const scrollRef = useAnimatedRef<T>();
  const scrollState = useSharedValue<ScrollState>(ScrollState.UNDETERMINED);
  const scrollContentSize = useSharedValue<NativeScrollSize>({
    width: 0,
    height: 0
  });
  const scrollContentOffset = useSharedValue<NativeScrollPoint>({ x: 0, y: 0 });
  const scrollVelocity = useSharedValue<NativeScrollVelocity>({ x: 0, y: 0 });
  const scrollLayoutMeasurement = useSharedValue<NativeScrollSize>({
    width: 0,
    height: 0
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollContentSize.value = event.contentSize;
      scrollLayoutMeasurement.value = event.layoutMeasurement;
      scrollContentOffset.value = event.contentOffset;
      if (event.velocity !== undefined) {
        scrollVelocity.value = event.velocity;
      }
    },
    onBeginDrag: (event) => {
      scrollState.value = ScrollState.DRAG_BEGIN;
      scrollContentSize.value = event.contentSize;
      scrollLayoutMeasurement.value = event.layoutMeasurement;
      scrollContentOffset.value = event.contentOffset;

      // FIXME: event.velocity is declared as NativeScrollVelocity | undefined
      // FIXME: Can it be that event.velocity be undefined?
      if (event.velocity !== undefined) {
        scrollVelocity.value = event.velocity;
      }
    },
    onEndDrag: (event) => {
      scrollState.value = ScrollState.DRAG_END;
      scrollContentOffset.value = event.contentOffset;
      if (event.velocity !== undefined) {
        scrollVelocity.value = event.velocity;
      }
    },
    onMomentumBegin: (event) => {
      scrollState.value = ScrollState.MOMENTUM_BEGIN;
      scrollContentOffset.value = event.contentOffset;
      if (event.velocity !== undefined) {
        scrollVelocity.value = event.velocity;
      }
    },
    onMomentumEnd: (event) => {
      scrollState.value = ScrollState.MOMENTUM_END;
      scrollContentOffset.value = event.contentOffset;
      if (event.velocity !== undefined) {
        scrollVelocity.value = event.velocity;
      }
    }
  });

  return {
    scrollRef,
    scrollHandler,
    scrollState,
    scrollContentSize,
    scrollContentOffset,
    scrollVelocity,
    scrollLayoutMeasurement
  };
};
