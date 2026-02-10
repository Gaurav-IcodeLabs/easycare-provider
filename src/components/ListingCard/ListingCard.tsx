import React, {useRef, useState} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import {fontScale, scale, width} from '../../utils';
import {car, list, star} from '../../assets';
import {colors, primaryFont, secondaryFont} from '../../constants';
import {AppText} from '../AppText/AppText';
import {useSelector} from 'react-redux';
import {selectSubSubcategoryByKeyAndType} from '../../slices/marketplaceData.slice';
import {useTranslation} from 'react-i18next';
import {ListingMenuPopover} from '../ListingMenuPopover/ListingMenuPopover';
import {useAppDispatch, RootState} from '../../sharetribeSetup';
import {closeOwnListing, openOwnListing} from '../../slices/listings.slice';
import {isListingNotDeleted} from '../../utils/listingValidation';

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
  const category = listing?.attributes?.publicData?.category ?? '';
  const subCategory = listing?.attributes?.publicData?.subcategory ?? '';
  const subSubCategory = listing?.attributes?.publicData?.subsubcategory ?? '';
  const {t} = useTranslation();
  const menuButtonRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const dispatch = useAppDispatch();

  // Get the subsubcategory data directly using optimized selector
  const subSubCategoryData = useSelector((state: any) =>
    selectSubSubcategoryByKeyAndType(state, subSubCategory, listingType),
  );

  // Check if listing is not deleted at any category level
  const isNotDeleted = useSelector((state: RootState) =>
    isListingNotDeleted(
      state,
      category,
      subCategory,
      subSubCategory,
      listingType,
    ),
  );

  // console.log(
  //   'listing?.attributes?.publicData',
  //   JSON.stringify(listing?.attributes?.publicData),
  // );
  console.log('isNotDeleted:', listing?.attributes?.title, isNotDeleted);

  const title = listing?.attributes?.title || 'Untitled';
  const description = listing?.attributes?.description || '';
  const state = listing?.attributes?.state || '';
  const isPublished = state === 'published';
  const isClosed = state === 'closed';

  // Get the first image from subsubcategory if available (only for services)
  const firstImage =
    subSubCategoryData && 'listingImages' in subSubCategoryData
      ? subSubCategoryData.listingImages?.[0]
      : null;

  // Helper function to get badge background style based on state
  const getBadgeStyle = (stateValue: string) => {
    switch (stateValue) {
      case 'published':
        return {backgroundColor: colors.positiveGreen};
      case 'pendingApproval':
        return {backgroundColor: colors.lightYellow};
      case 'draft':
        return {backgroundColor: colors.lightGrey};
      case 'closed':
        return {backgroundColor: colors.red};
      default:
        return {backgroundColor: colors.lightGrey};
    }
  };

  // Helper function to get badge text color based on state
  const getBadgeTextStyle = (stateValue: string) => {
    switch (stateValue) {
      case 'published':
        return {color: colors.white};
      case 'pendingApproval':
        return {color: colors.textBlack};
      case 'draft':
        return {color: colors.neutralDark};
      case 'closed':
        return {color: colors.white};
      default:
        return {color: colors.neutralDark};
    }
  };

  const handleToggle = async () => {
    try {
      await dispatch(
        state === 'published'
          ? closeOwnListing({id: listing.id})
          : openOwnListing({id: listing.id}),
      );
    } catch (error) {
      console.error('Error toggling listing status:', error);
    }
  };

  return (
    <Pressable
      style={[
        styles.container,
        containerStyle,
        !isNotDeleted && {opacity: 0.5},
      ]}
      disabled={!isNotDeleted}
      onPress={onPress}>
      {firstImage ? (
        <Image source={{uri: firstImage}} style={styles.image} />
      ) : (
        <Image source={car} resizeMode="contain" style={styles.image} />
      )}
      <View style={styles.badgeContainer}>
        {state ? (
          <View style={[styles.badge, getBadgeStyle(state)]}>
            <AppText style={[styles.badgeText, getBadgeTextStyle(state)]}>
              {state === 'pendingApproval'
                ? t('ListingCard.pendingApproval')
                : state === 'published'
                ? t('ListingCard.published')
                : state === 'draft'
                ? t('ListingCard.draft')
                : state === 'closed'
                ? t('ListingCard.closed')
                : state}
            </AppText>
          </View>
        ) : null}
      </View>
      {(isPublished || isClosed) && isNotDeleted && (
        <Pressable
          ref={menuButtonRef}
          style={styles.shareSection}
          onPress={() => setShowMenu(true)}>
          <Image style={styles.shareIcon} source={list} />
        </Pressable>
      )}
      <View style={styles.bottomSection}>
        <View style={styles.rowStyle}>
          <AppText style={styles.title}>{title}</AppText>
          <View style={styles.reviewSection}>
            <Image style={styles.icon} source={star} />
            <AppText style={styles.distance}>5.0</AppText>
          </View>
        </View>

        {description ? (
          <View style={styles.rowStyle}>
            <AppText style={styles.location} numberOfLines={1}>
              {description}
            </AppText>
          </View>
        ) : null}
      </View>

      <ListingMenuPopover
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onToggleStatus={handleToggle}
        isPublished={isPublished}
        isClosed={isClosed}
        fromView={menuButtonRef}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#00000020',
    paddingVertical: scale(4),
    paddingHorizontal: scale(6),
    gap: scale(2),
    borderRadius: scale(10),
  },
  badgeContainer: {
    position: 'absolute',
    top: scale(12),
    left: scale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: scale(8),
    paddingHorizontal: scale(16),
    gap: scale(6),
  },
  rowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  badge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(12),
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: fontScale(10),
    fontWeight: '500',
    textTransform: 'capitalize',
    ...primaryFont('500'),
  },
});
