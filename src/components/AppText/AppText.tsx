import React from 'react';
import {Text, TextProps} from 'react-native';

export const AppText: React.FC<TextProps> = props => {
  return (
    <Text {...props} allowFontScaling={false}>
      {props.children}
    </Text>
  );
};
