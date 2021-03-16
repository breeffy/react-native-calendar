import {
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated';
import { ScrollState } from '../constants';
import type {
  NativeScrollPoint,
  NativeScrollSize,
  NativeScrollVelocity
} from 'react-native';

export const useCalendarScroll = () => {
  const scrollState = useSharedValue<ScrollState>(
    ScrollState.UNDETERMINED,
    false
  );
  const scrollContentSize = useSharedValue<NativeScrollSize>(
    { width: 0, height: 0 },
    false
  );
  const scrollContentOffset = useSharedValue<NativeScrollPoint>(
    { x: 0, y: 0 },
    false
  );
  const scrollVelocity = useSharedValue<NativeScrollVelocity>(
    { x: 0, y: 0 },
    false
  );
  const scrollLayoutMeasurement = useSharedValue<NativeScrollSize>({
    width: 0,
    height: 0
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollState.value = ScrollState.ON_SCROLL;
      scrollContentSize.value = event.contentSize;
      scrollLayoutMeasurement.value = event.layoutMeasurement;
      scrollContentOffset.value = event.contentOffset;
      scrollVelocity.value = event.velocity;
      // if (event.velocity !== undefined) {
      // }
    },
    onBeginDrag: (event) => {
      scrollState.value = ScrollState.DRAG_BEGIN;
      scrollContentSize.value = event.contentSize;
      scrollLayoutMeasurement.value = event.layoutMeasurement;
      scrollContentOffset.value = event.contentOffset;
      scrollVelocity.value = event.velocity;

      // FIXME: event.velocity is declared as NativeScrollVelocity | undefined
      // FIXME: Can it be that event.velocity be undefined?
      // if (event.velocity !== undefined) {
      // }
    },
    onEndDrag: (event) => {
      scrollState.value = ScrollState.DRAG_END;
      scrollContentOffset.value = event.contentOffset;
      scrollVelocity.value = event.velocity;
      // if (event.velocity !== undefined) {
      // }
    },
    onMomentumBegin: (event) => {
      scrollState.value = ScrollState.MOMENTUM_BEGIN;
      scrollContentOffset.value = event.contentOffset;
      scrollVelocity.value = event.velocity;
      // if (event.velocity !== undefined) {
      // }
    },
    onMomentumEnd: (event) => {
      scrollState.value = ScrollState.MOMENTUM_END;
      scrollContentOffset.value = event.contentOffset;
      scrollVelocity.value = event.velocity;
      // if (event.velocity !== undefined) {
      // }
    }
  });

  return {
    scrollHandler,
    scrollState,
    scrollContentSize,
    scrollContentOffset,
    scrollVelocity,
    scrollLayoutMeasurement
  };
};
