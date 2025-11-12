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
  GradientWrapper,
  ListingCard,
  ListingCardHorizontal,
} from '../../components';
import {carwash, easycare, magnify, offer50, placeholder} from '../../assets';
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
      {/* <View style={styles.headerImgContainer}>
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <AppText
              style={{
                fontSize: 60,
                fontWeight: '700',
                color: '#ffffffff',
                lineHeight: 64,
              }}>
              50%
            </AppText>

            <View
              style={{
                backgroundColor: '#fdb75c',
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 4,
                marginTop: -20,
                marginBottom: -12,
                zIndex: 1,
              }}>
              <AppText style={{color: '#fff', fontSize: 14, fontWeight: '600'}}>
                Instant
              </AppText>
            </View>

            <AppText
              style={{
                fontSize: 38,
                fontWeight: '500',
                color: '#ffffffff',
                lineHeight: 42,
              }}>
              Discount
            </AppText>
            <AppText style={{color: colors.white}}>
              On your first service
            </AppText>
          </View>
          <Image style={styles.carwashImg} source={carwash} />
        </View> */}
      {/* <View style={{marginTop: scale(20)}}>
        <ListingCard />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{marginTop: scale(20)}}
        contentContainerStyle={{paddingHorizontal: scale(20), gap: scale(16)}}>
        {Array.from({length: 3}).map((_, index) => (
          <ListingCardHorizontal key={index} />
        ))}
      </ScrollView> */}
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
