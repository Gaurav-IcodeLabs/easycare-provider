import {StyleSheet, Text, View} from 'react-native';
import React, {FC} from 'react';
import {scale, width} from '../../../utils';

export const HomeHeader: FC = () => {
  return (
    <View style={styles.section}>
      <Text>HomeHeader</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    height: scale(150),
    // width: width,
    // zIndex: -1,
    backgroundColor: 'red',
  },
});
