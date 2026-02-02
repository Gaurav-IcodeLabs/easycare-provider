import {Image, Pressable, StyleSheet, View} from 'react-native';
import React from 'react';
import {fontScale, scale, width} from '../../utils';
import {car, locationInactive, share, star} from '../../assets';
import {colors, primaryFont, secondaryFont} from '../../constants';
import {AppText} from '../AppText/AppText';
import {useSelector} from 'react-redux';
import {selectSubSubcategoryByKeyAndType} from '../../slices/marketplaceData.slice';

interface ListingCardProps {
  listing: any;
  onPress?: () => void;
  containerStyle?: any;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onPress,
  containerStyle,
}) => {
  const listingType = listing?.attributes?.publicData?.listingType;
  const subSubCategory = listing?.attributes?.publicData?.subsubcategory ?? '';

  // Get the subsubcategory data directly using optimized selector
  const subSubCategoryData = useSelector((state: any) =>
    selectSubSubcategoryByKeyAndType(state, subSubCategory, listingType),
  );

  const title = listing?.attributes?.title || 'Untitled';
  const location = listing?.attributes?.publicData?.location?.address || '';
  const state = listing?.attributes?.state || '';

  // Get the first image from subsubcategory if available (only for services)
  const firstImage =
    subSubCategoryData && 'listingImages' in subSubCategoryData
      ? subSubCategoryData.listingImages?.[0]
      : null;

  return (
    <Pressable style={[styles.container, containerStyle]} onPress={onPress}>
      {firstImage ? (
        <Image source={{uri: firstImage}} style={styles.image} />
      ) : (
        <Image source={car} resizeMode="contain" style={styles.image} />
      )}
      <View style={styles.reviewSection}>
        <Image style={styles.icon} source={star} />
        <AppText style={styles.distance}>5.0</AppText>
      </View>
      <Pressable style={styles.shareSection}>
        <Image style={styles.shareIcon} source={share} />
      </Pressable>
      <View style={styles.bottomSection}>
        <AppText style={styles.title}>{title}</AppText>
        {location ? (
          <View style={styles.rowStyle}>
            <Image
              tintColor={colors.neutralDark}
              source={locationInactive}
              style={styles.icon}
            />
            <AppText style={styles.location} numberOfLines={1}>
              {location}
            </AppText>
          </View>
        ) : null}
        {state ? (
          <View style={styles.rowStyle}>
            <AppText style={styles.stateText}>{state}</AppText>
          </View>
        ) : null}
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
  stateText: {
    fontSize: fontScale(12),
    color: colors.neutralDark,
    fontWeight: '400',
    textTransform: 'capitalize',
    ...primaryFont('400'),
  },
});
