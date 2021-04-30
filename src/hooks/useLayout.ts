import { PixelRatio } from 'react-native';
import { useMemoOne } from 'use-memo-one';

interface Props {
  mode: 'horizontal' | 'vertical';
  width: number;
  height: number;
}

export const useLayout = ({ mode, width, height }: Props) => {
  const layout = useMemoOne(() => {
    if (mode === 'horizontal') {
      const roundedWidth = PixelRatio.roundToNearestPixel(width);
      return {
        width: roundedWidth,
        height: height
      };
    } else {
      const roundedHeight = PixelRatio.roundToNearestPixel(height);
      return {
        width: width,
        height: roundedHeight
      };
    }
  }, [mode, width, height]);
  return layout;
};
