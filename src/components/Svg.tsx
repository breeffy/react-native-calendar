import React from 'react';
import { View } from 'react-native';
import { Svg, Line as SvgLine, Circle as SvgCircle } from 'react-native-svg';
import type { WithViewStyleProp } from '../types';

export type LineProps = {} & WithViewStyleProp;

export const Line = ({ style }: LineProps) => (
  <View style={style}>
    <Svg width={'100%'} height={1} fill="none">
      <SvgLine
        x1={0}
        y1={0}
        x2={'100%'}
        y2={0}
        stroke={'rgba(68, 82, 95, 0.1)'}
        strokeWidth={1}
      />
    </Svg>
  </View>
);

export type CircleProps = {} & WithViewStyleProp;

export const Circle = ({ style }: CircleProps) => {
  return (
    <View style={style}>
      <Svg width={38} height={38} viewBox="0 0 38 38" fill="none">
        <SvgCircle opacity={0.15} cx={19} cy={19} r={19} fill="#2D9AFC" />
      </Svg>
    </View>
  );
};
