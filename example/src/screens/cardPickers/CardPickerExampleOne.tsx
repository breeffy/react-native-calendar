import React, { PropsWithChildren } from 'react';
import {
  Dimensions,
  Image,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from 'react-native';
import { CardPicker } from '@breeffy/react-native-calendar';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { useCallbackOne, useMemoOne } from 'use-memo-one';
import { Images } from './Images';
import type {
  CardItemProps,
  CardPickerProps
} from '@breeffy/react-native-calendar';

const windowWidth = Dimensions.get('window').width;

const Settings = {
  pickerSize: windowWidth,
  itemWidth: 200,
  itemHeight: 300,
  imageMargin: 40
};

interface CardPickerItemProps<T> extends CardItemProps<T> {
  style?: StyleProp<ViewStyle>;
}

export const CardPickerItem = <T,>({
  itemIndex,
  itemWidth,
  itemHeight,
  currentIndex,
  translates,
  scales,
  pickerBorderDistance,
  style: _style,
  children
}: PropsWithChildren<CardPickerItemProps<T>>) => {
  const style = useAnimatedStyle(() => {
    const opacity = interpolate(
      currentIndex.value,
      [itemIndex - 3, itemIndex - 2, itemIndex - 1, itemIndex, itemIndex + 1],
      [0, 1, 1, 1, 0.2],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      currentIndex.value,
      [
        itemIndex - 3,
        itemIndex - 2,
        itemIndex - 1,
        itemIndex,
        itemIndex + 1,
        itemIndex + 2,
        itemIndex + 3
      ],
      [scales[3], scales[2], scales[1], scales[0], 0.8],
      Extrapolate.EXTEND
    );

    const translateX = interpolate(
      currentIndex.value,
      [
        itemIndex - 4,
        itemIndex - 3,
        itemIndex - 2,
        itemIndex - 1,
        itemIndex,
        itemIndex + 1
      ],
      [
        0,
        translates[3],
        translates[2],
        translates[1],
        translates[0],
        -pickerBorderDistance
      ],
      Extrapolate.CLAMP
    );

    return {
      width: itemWidth,
      height: itemHeight,
      overflow: 'hidden',
      opacity: opacity,
      transform: [
        {
          translateX: translateX
        },
        { scale: scale }
      ]
    };
  }, [translates, scales]);

  const containerStyle = useMemoOne(() => {
    return [_style, style];
  }, [_style, style]);

  return <Animated.View style={containerStyle}>{children}</Animated.View>;
};

export const CardPickerExampleOne = () => {
  const items: number[] = [...Array(10)];
  const index = useSharedValue(0);

  const keyExtractor = useCallbackOne((_: number, index: number) => {
    return String(index);
  }, []);

  const renderItem = useCallbackOne<CardPickerProps<number>['renderItem']>(
    (props) => {
      console.log(
        `images length: ${Images.length},props: ${JSON.stringify(
          props.itemIndex
        )}`
      );
      const index = (props.itemIndex + 1) % Images.length;
      console.log(`index is [${index}]`);
      const source = Images[index].source;

      return (
        <CardPickerItem {...props} style={styles.cardPickerItem}>
          <Image
            source={source}
            resizeMode="cover"
            style={{
              width: props.itemWidth,
              height: props.itemHeight
            }}
          />
          {/* <TextView itemIndex={props.itemIndex} /> */}
        </CardPickerItem>
      );
    },
    []
  );

  const itemScales = useMemoOne(() => [1, 0.9, 0.8, 0.7, 0.6], []);
  const getItemOffset = useCallbackOne(
    (itemScale: number, itemSize: number) => {
      // return itemScale * (itemSize + 20);
      return 20;
    },
    []
  );

  return (
    <CardPicker
      items={items}
      mode="horizontal"
      scrollMode="multipleValues"
      scrollComponentKind="scrollview"
      scrollModeDeceleration="fast"
      pickerSize={Settings.pickerSize}
      itemWidth={Settings.itemWidth}
      itemHeight={Settings.itemHeight}
      itemScales={itemScales}
      getItemOffset={getItemOffset}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      currentIndex={index}
    />
  );
};

const styles = StyleSheet.create({
  cardPickerItem: {
    borderRadius: 16,
    backgroundColor: 'orange'
  }
});
