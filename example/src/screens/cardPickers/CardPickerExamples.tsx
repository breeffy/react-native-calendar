import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useContainerStyle } from '../basic/hooks';
import { CardPickerExampleOne } from './CardPickerExampleOne';
import { CardPickerExampleThree } from './CardPickerExampleThree';
import { CardPickerExampleTwo } from './CardPickerExampleTwo';

export const CardPickerExamples = () => {
  const containerStyle = useContainerStyle();
  console.log(`containerStyle: ${JSON.stringify(containerStyle)}`);

  return (
    <ScrollView>
      <View style={styles.cardWrapper}>
        <CardPickerExampleOne />
      </View>
      <View style={styles.cardWrapper}>
        <CardPickerExampleTwo />
      </View>
      <View style={styles.cardWrapper}>
        <CardPickerExampleThree />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 40
  }
});
