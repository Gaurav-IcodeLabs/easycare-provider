import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {ScreenHeader} from '../../components/ScreenHeader/ScreenHeader';
import {height, scale, topInset, width} from '../../utils';
import {colors, SCREENS} from '../../constants';
import {
  AppText,
  Button,
  GradientWrapper,
  ListingCard,
  ListingCardHorizontal,
} from '../../components';
import {carwash, easycare, magnify, offer50, placeholder} from '../../assets';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BottomTabParamList, MainStackParamList} from '../../apptypes';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HomeHeader} from './components/HomeHeader';

type HomeNavigationProp = NativeStackNavigationProp<
  BottomTabParamList,
  typeof SCREENS.HOME
>;

export const Home: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const {top} = useSafeAreaInsets();

  const handleProfilePress = () => {
    navigation.navigate(SCREENS.PROFILE);
  };

  return (
    <View style={[styles.container, {paddingTop: top}]}>
      <HomeHeader />
      {/* <ScreenHeader
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
  container: {
    flex: 1,
    // backgroundColor: colors.white,
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
