import React from 'react';
import {Text, StyleSheet, TextStyle} from 'react-native';
import {scale} from '../../utils';
import {colors, primaryFont} from '../../constants';
import {AppText} from '../AppText/AppText';

interface ErrorMessageProps {
  error?: string;
  textStyles?: TextStyle;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  textStyles,
}) => {
  if (!error) return null;

  return <AppText style={[styles.errorText, textStyles]}>{error}</AppText>;
};

const styles = StyleSheet.create({
  errorText: {
    color: colors.red || '#FF0000',
    fontSize: scale(12),
    marginTop: scale(5),
    ...primaryFont('400'),
  },
});
