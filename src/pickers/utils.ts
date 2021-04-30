export interface ItemInfo {
  scale: number;
  offset: number;
}

export interface Accumulator {
  itemSize: number;
  currentOffset: number;
  translates: number[];
}

export const cardReducer = (
  acc: Accumulator,
  itemInfo: ItemInfo,
  index: number
) => {
  const scale = itemInfo.scale;
  const scaledSize = acc.itemSize * scale;

  if (index === 0) {
    acc.translates[index] = 0;
    acc.currentOffset = scaledSize;
  } else {
    // Move to coordinate origin
    const offsetToOrigin = acc.itemSize * (index + (1 - itemInfo.scale) / 2);
    // Scale item size
    // Position item with item offset
    const offset = itemInfo.offset;
    // acc.translates[index] = acc.itemSize * (index + (scale - 1)/2);
    acc.translates[index] =
      acc.currentOffset - offsetToOrigin - scaledSize + offset;

    // Shift current offset on item offset
    acc.currentOffset += offset;
  }

  return acc;
};
