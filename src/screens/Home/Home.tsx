import {Image, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {ScreenHeader} from '../../components/ScreenHeader/ScreenHeader';
import {scale, width} from '../../utils';
import {colors, SCREENS} from '../../constants';
import {GradientWrapper} from '../../components';
import {easycare, magnify, placeholder} from '../../assets';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainStackParamList} from '../../apptypes';

type HomeNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  typeof SCREENS.HOME
>;

export const Home: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();

  const handleProfilePress = () => {
    navigation.navigate(SCREENS.PROFILE);
  };

  return (
    <GradientWrapper>
      <ScreenHeader
        containerStyle={{paddingHorizontal: scale(20)}}
        renderLeft={() => (
          <TouchableOpacity onPress={handleProfilePress}>
            <Image source={placeholder} style={styles.left} />
          </TouchableOpacity>
        )}
        renderCenter={() => <Image source={easycare} resizeMode="contain" />}
        renderRight={() => (
          <TouchableOpacity>
            <Image source={magnify} style={styles.right} />
          </TouchableOpacity>
        )}
      />
    </GradientWrapper>
  );
};

const styles = StyleSheet.create({
  outercontainer: {
    flex: 1,
    backgroundColor: colors.milkWhite,
  },
  topsection: {
    width: width,
    justifyContent: 'flex-start',
  },
  headerContainer: {
    // paddingTop: topInset,
    justifyContent: 'flex-start',
    paddingBottom: scale(80),
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
  headerImgContainer: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    justifyContent: 'space-between',
    marginTop: scale(10),
  },
  discountImg: {
    width: scale(135),
    height: scale(123),
  },
  carwashImg: {
    width: scale(170),
    height: scale(125),
  },
});
