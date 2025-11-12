import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {ScreenHeader} from '../../components/ScreenHeader/ScreenHeader';
import {height, scale, topInset, width} from '../../utils';
import {colors} from '../../constants';
import {AppText, GradientWrapper} from '../../components';
import {easycare, magnify, placeholder} from '../../assets';

export const Location: React.FC = () => {
  return (
    <View style={styles.outercontainer}>
      <GradientWrapper style={styles.topsection}>
        <View style={styles.headerContainer}>
          <ScreenHeader
            transparentBackground={true}
            leftIcon={placeholder}
            rightIcon={magnify}
            rightIconStyle={styles.right}
            titleIcon={easycare}
            leftIconStyle={styles.left}
            onLeftIconPress={() => console.log('left icon pressed')}
          />
        </View>
      </GradientWrapper>
      <View>
        <AppText>My Location</AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outercontainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topsection: {
    width: width,
    height: height / 3,
    justifyContent: 'flex-start',
  },
  headerContainer: {
    paddingTop: topInset,
    flex: 1,
    justifyContent: 'flex-start',
  },
  right: {
    width: scale(40),
    height: scale(40),
    padding: scale(8),
    backgroundColor: '#417ABD',
    borderRadius: scale(10),
  },
  left: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(10),
  },
});
