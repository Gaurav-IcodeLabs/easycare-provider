import {StyleSheet} from 'react-native';
import React from 'react';
import {AppText, GradientWrapper} from '../../components';

export const Orders: React.FC = () => {
  return (
    <GradientWrapper>
      <AppText>Orders</AppText>
    </GradientWrapper>
  );
};

const styles = StyleSheet.create({root: {flex: 1}});
