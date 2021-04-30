import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMemoOne } from 'use-memo-one';

export interface TextViewProps {
  itemIndex: number;
}

export const TextView = ({ itemIndex }: TextViewProps) => {
  const textViewStyle = useMemoOne(() => {
    return [
      styles.textView,
      { backgroundColor: itemIndex % 2 === 0 ? 'orange' : 'lavender' }
    ];
  }, [styles.textView, itemIndex]);

  return (
    <View style={textViewStyle}>
      <Text style={styles.text}>{itemIndex}</Text>
    </View>
  );
};

export const styles = StyleSheet.create({
  textView: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: { fontSize: 26, fontWeight: 'bold' }
});
