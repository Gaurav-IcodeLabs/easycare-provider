import {Image, Pressable, StyleSheet, View} from 'react-native';
import React from 'react';
import {fontScale, scale, width} from '../../utils';
import {car, distance, locationInactive, share, star} from '../../assets';
import {colors, primaryFont, secondaryFont} from '../../constants';
import {AppText} from '../AppText/AppText';

interface ListingCardProps {}

export const ListingCard: React.FC<ListingCardProps> = () => {
  return (
    <Pressable style={styles.container}>
      <Image source={car} resizeMode="contain" style={styles.image} />
      {/* <AppImage
        source={{
          uri:'',// imageUi,
        }}
        width={width - scale(40)}
        aspectRatio="16/9"
      /> */}
      <View style={styles.reviewSection}>
        <Image style={styles.icon} source={star} />
        <AppText style={styles.distance}>5.0</AppText>
      </View>
      <Pressable style={styles.shareSection}>
        <Image style={styles.shareIcon} source={share} />
      </Pressable>
      <View style={styles.bottomSection}>
        <AppText style={styles.title}>Al-Wafa Car Wash</AppText>
        <View style={styles.rowStyle}>
          <Image
            tintColor={colors.neutralDark}
            source={locationInactive}
            style={styles.icon}
          />
          <AppText style={styles.location}>
            King Abdulaziz Street, Al - Car Wash
          </AppText>
        </View>
        <View style={styles.rowStyle}>
          <Image source={distance} style={styles.icon} />
          <AppText style={styles.distance}>2.05 km</AppText>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: scale(20),
    width: width - scale(40),
    backgroundColor: colors.white,
    overflow: 'hidden',
    alignSelf: 'center', // manage from parent
  },
  image: {
    width: '100%',
    height: scale(170),
    backgroundColor: colors.lightGrey,
  },
  reviewSection: {
    position: 'absolute',
    top: scale(12),
    left: scale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: scale(4),
    paddingHorizontal: scale(6),
    gap: scale(2),
    borderRadius: scale(10),
  },
  shareSection: {
    position: 'absolute',
    top: scale(12),
    right: scale(12),
  },
  shareIcon: {
    height: scale(24),
    width: scale(24),
  },
  bottomSection: {
    borderWidth: 1,
    borderTopColor: colors.transparent,
    borderColor: colors.lightGrey,
    borderBottomEndRadius: scale(20),
    borderBottomStartRadius: scale(20),
    padding: scale(16),
    gap: scale(6),
  },
  rowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: scale(5),
  },
  icon: {
    height: scale(16),
    width: scale(16),
  },
  title: {
    fontSize: fontScale(18),
    color: colors.deepBlue,
    textAlign: 'left',
    fontWeight: '500',
    ...secondaryFont('500'),
  },
  location: {
    fontSize: fontScale(14),
    color: colors.neutralDark,
    fontWeight: '400',
    ...primaryFont('400'),
  },
  distance: {
    fontSize: fontScale(14),
    color: colors.black,
    fontWeight: '400',
    ...primaryFont('400'),
  },
});
