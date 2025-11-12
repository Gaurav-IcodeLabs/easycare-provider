import {Text, Image, StyleSheet, ImageSourcePropType, View} from 'react-native';
import React from 'react';
import {scale} from '../../utils';
import {colors} from '../../constants';
import {AppText} from '../../components';

interface TabIconProps {
  source: ImageSourcePropType;
  focusedSource: ImageSourcePropType;
  focused: boolean;
  label: string;
}

export const TabIcon: React.FC<TabIconProps> = ({
  source,
  focusedSource,
  focused,
  label,
}) => {
  return (
    <View style={styles.icon}>
      <Image
        source={focused ? focusedSource : source}
        style={styles.iconImage}
      />
      <AppText style={[styles.iconText, focused && styles.focusedText]}>
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: scale(70),
    alignSelf: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: scale(11),
    marginTop: scale(4),
    fontWeight: '600',
    color: colors.grey,
  },
  focusedText: {
    color: colors.blue,
  },
  iconImage: {
    height: scale(22),
    width: scale(22),
  },
});
