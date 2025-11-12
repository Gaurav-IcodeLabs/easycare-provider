import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {fontScale, lightenColor, scale, width} from '../../utils';
import {colors, primaryFont, secondaryFont} from '../../constants';
import {
  distance,
  heart,
  locationInactive,
  placeholder,
  star,
} from '../../assets';
import {Button} from '../Button/Button';
import {AppText} from '../AppText/AppText';

interface ListingCardHorizontalProps {}

export const ListingCardHorizontal: React.FC<
  ListingCardHorizontalProps
> = () => {
  return (
    <Pressable style={styles.container}>
      <Pressable style={styles.likeSection}>
        <Image style={styles.icon} source={heart} />
      </Pressable>
      <View style={styles.topSection}>
        <View style={styles.imageSection}>
          <Image
            resizeMode="contain"
            style={{height: '100%', width: '100%'}}
            source={placeholder}
          />
        </View>
        <View style={styles.detailsSection}>
          <AppText numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
            Al-Wafa Car Wash
          </AppText>

          <View style={styles.rowStyle}>
            <Image
              tintColor={colors.neutralDark}
              source={locationInactive}
              style={styles.icon}
            />
            <AppText
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.location}>
              King Abdulaziz Street, Al - Car Wash
            </AppText>
          </View>

          {/* <View style={styles.rowStyle}>
            <Image source={distance} style={styles.icon} />
            <AppText
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.distance}>
              2.05 km
            </AppText>
          </View> */}
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.bottomSection}>
        <View style={styles.rowStyle}>
          <Image style={styles.icon} source={star} />
          <AppText numberOfLines={1} style={styles.ratingText}>
            4.8{' '}
            <AppText style={[styles.ratingText, {...primaryFont('400')}]}>
              {'(21 Reviews)'}
            </AppText>
          </AppText>
        </View>
        <Button title="Car Wash" style={styles.button} useGradient={false} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: scale(20),
    width: width - scale(40),
    overflow: 'hidden',
    padding: scale(20),
  },
  likeSection: {
    position: 'absolute',
    top: scale(16),
    right: scale(16),
    zIndex: 10,
    height: scale(24),
    width: scale(24),
    backgroundColor: colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(5),
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    paddingBottom: scale(10),
  },
  imageSection: {
    width: scale(60),
    height: scale(60),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: scale(10),
    overflow: 'hidden',
  },
  detailsSection: {
    flex: 1,
    flexShrink: 1,
    gap: scale(6),
  },
  title: {
    fontSize: fontScale(18),
    color: colors.deepBlue,
    textAlign: 'left',
    fontWeight: '500',
    marginRight: scale(10), // to show like icon
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
  divider: {
    height: scale(1),
    backgroundColor: colors.lightGrey,
    marginVertical: scale(12),
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
  },
  icon: {
    height: scale(16),
    width: scale(16),
  },
  ratingText: {
    color: colors.deepBlue,
    fontSize: fontScale(14),
    ...primaryFont('600'),
  },
  button: {
    height: scale(30),
    backgroundColor: colors.blue,
    paddingHorizontal: scale(10),
  },
});
