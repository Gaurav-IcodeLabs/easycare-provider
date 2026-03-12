import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {useTranslation} from 'react-i18next';
import {AppText} from '../AppText/AppText';
import {getProcess, resolveLatestProcessName} from '../../transactions';
import {car} from '../../assets';
import {useSelector} from 'react-redux';
import {
  entitiesSelector,
  getListingsById,
  selectSubSubcategoryByKeyAndType,
} from '../../slices/marketplaceData.slice';
import {colors} from '../../constants';
import {scale} from '../../utils';
import {getStateData} from '../../screens/Transaction/TransactionPage.stateData';
import {useTypedSelector} from '../../sharetribeSetup';

interface OrderCardProps {
  transaction: any;
}

export const OrderCard: React.FC<OrderCardProps> = ({transaction}) => {
  const {t} = useTranslation();
  const createdAt = transaction.attributes?.createdAt;
  const listingTitle = transaction?.listing?.attributes?.title;
  const customerName = transaction?.customer?.attributes?.profile?.displayName;
  const price = transaction?.listing?.attributes?.price;
  const booking = transaction?.booking;
  const startDate = booking?.attributes?.start;
  const endDate = booking?.attributes?.end;
  const listingId = transaction?.listing?.id.uuid;
  const entities = useTypedSelector(entitiesSelector);
  const listing = getListingsById(entities, [listingId])?.[0];
  const listingType = listing?.attributes?.publicData?.listingType;
  const subSubCategory = listing?.attributes?.publicData?.subsubcategory ?? '';
  const subSubCategoryData = useSelector((state: any) =>
    selectSubSubcategoryByKeyAndType(state, subSubCategory, listingType),
  );
  const firstImage =
    subSubCategoryData && 'listingImages' in subSubCategoryData
      ? subSubCategoryData.listingImages?.[0]
      : null;

  const processName = resolveLatestProcessName(
    transaction.attributes?.processName,
  );

  let process = null;
  try {
    process = processName ? getProcess(processName) : null;
  } catch (error) {
    // Process was not recognized!
  }

  const stateData =
    getStateData?.(
      {
        transaction,
        t,
        transactionRole: 'provider',
        colors,
      },
      process,
    ) || {};
  const {processState, stateColor} = stateData;

  return (
    <View style={styles.orderItem}>
      {/* Image Section */}
      {firstImage ? (
        <Image source={{uri: firstImage}} style={styles.image} />
      ) : (
        <Image source={car} resizeMode="contain" style={styles.image} />
      )}

      {/* Status Badge Overlay */}
      {processState && processName && (
        <View style={styles.statusBadgeOverlay}>
          <View style={[styles.statusBadge, {borderColor: stateColor}]}>
            <AppText style={[styles.statusText, {color: stateColor}]}>
              {t(`OrdersPage.${processName}.${processState}.status`, {
                defaultValue: processState.replace(/-/g, ' '),
              })}
            </AppText>
          </View>
        </View>
      )}

      {/* Content Section */}
      <View style={styles.contentSection}>
        {/* Order Header */}
        {/* <View style={styles.orderHeader}>
          <AppText style={styles.orderId}>
            {t('Orders.orderId')}
            {transaction?.id?.uuid?.slice(-8)}
          </AppText>
        </View> */}

        {/* Listing Title */}
        {listingTitle && (
          <AppText style={styles.listingTitle} numberOfLines={2}>
            {listingTitle}
          </AppText>
        )}

        {/* Customer Name */}
        {customerName && (
          <AppText style={styles.customerName}>
            {t('Orders.customer')}: {customerName}
          </AppText>
        )}

        {/* Price */}
        {price && (
          <AppText style={styles.price}>
            {t('Orders.total')}: {price.currency}{' '}
            {(price.amount / 100).toFixed(2)}
          </AppText>
        )}

        {/* Booking Dates */}
        {/* {booking && startDate && endDate && (
          <View style={styles.bookingInfo}>
            <AppText style={styles.bookingDate}>
              {t('Orders.start')}: {new Date(startDate).toLocaleDateString()}
            </AppText>
            <AppText style={styles.bookingDate}>
              {t('Orders.end')}: {new Date(endDate).toLocaleDateString()}
            </AppText>
          </View>
        )} */}

        {/* Created Date */}
        <AppText style={styles.orderDate}>
          {t('Orders.created')}: {new Date(createdAt).toLocaleDateString()}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  orderItem: {
    backgroundColor: colors.white,
    borderRadius: scale(12),
    marginBottom: scale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: scale(170),
    backgroundColor: '#f0f0f0',
  },
  statusBadgeOverlay: {
    position: 'absolute',
    top: scale(12),
    right: scale(12),
    zIndex: 1,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  contentSection: {
    padding: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#e0e0e0',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  bookingInfo: {
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  bookingDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
