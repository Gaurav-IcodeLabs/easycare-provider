import {ActivityIndicator, StyleSheet, View} from 'react-native';
import React, {FC, useEffect, useState} from 'react';
import {colors, primaryFont} from '../../constants';
import {ScreenHeader} from '../../components/ScreenHeader/ScreenHeader';
import {backIcon} from '../../assets';
import {AppText, Button, ListingSuccessModal} from '../../components';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  fontScale,
  pickCategoryFieldsForProductOrService,
  scale,
  types as sdkTypes,
} from '../../utils';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {useConfiguration} from '../../context';
import {
  createListingDraftInProgressSelector,
  listingIdSelector,
  publishDraftInProgressSelector,
  requestCreateListingDraft,
  requestPublishListingDraft,
  requestShowListing,
  requestUpdateListing,
  updateInProgressSelector,
} from '../../slices/editlisting.slice';
import {ensureOwnListing} from '../../utils/data';
import {
  getInitialValues,
  getOwnListing,
  getTransactionInfo,
  hasSetListingType,
  pickListingFieldsData,
  setNoAvailabilityForUnbookableListings,
} from './components/helper';
import {entitiesSelector} from '../../slices/marketplaceData.slice';
import {EditListingDetailsForm} from './components/EditListingDetailsForm';

const draftId = '00000000-0000-0000-0000-000000000000';

type EditListingRouteParams = {
  EditListing: {
    listingId?: string;
    listingType?: string;
  };
};

type EditListingRouteProp = RouteProp<EditListingRouteParams, 'EditListing'>;

interface FormValues {
  [key: string]: any;
}

export const EditListing: FC = () => {
  const {t} = useTranslation();
  const {top} = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const config = useConfiguration() as any;
  const marketplaceCurrency = config.currency;
  const route = useRoute<EditListingRouteProp>();
  const {listingType = ''} = route.params || {};
  const listingId = useTypedSelector(listingIdSelector);
  const entities = useTypedSelector(entitiesSelector);
  const createInProgress = useTypedSelector(
    createListingDraftInProgressSelector,
  );
  const updateInProgress = useTypedSelector(updateInProgressSelector);
  const publishInProgress = useTypedSelector(publishDraftInProgressSelector);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isLoading =
    createInProgress || updateInProgress || publishInProgress || loading;
  const id = listingId || new sdkTypes.UUID(draftId);
  const currentListing = ensureOwnListing(getOwnListing(entities, id));
  const {publicData, state, price} = currentListing?.attributes || {};

  const listingTypes = config.listing.listingTypes;
  const listingFields = config.listing.listingFields;
  const listingCategories = config.listingCategories;
  const categoryKey = config.categoryConfiguration.key;

  const handleShowListing = async () => {
    try {
      setIsInitialLoading(true);
      if (route.params?.listingId) {
        await dispatch(
          requestShowListing({id: route.params.listingId, config}),
        ).unwrap();
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    handleShowListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.listingId]);

  const {hasExistingListingType, existingListingTypeInfo} =
    hasSetListingType(publicData);

  const hasValidExistingListingType =
    hasExistingListingType &&
    !!listingTypes.find((conf: any) => {
      const listinTypesMatch =
        conf.listingType === existingListingTypeInfo.listingType;
      const unitTypesMatch =
        conf.transactionType?.unitType === existingListingTypeInfo.unitType;
      return listinTypesMatch && unitTypesMatch;
    });

  const initialValues = getInitialValues(
    currentListing,
    existingListingTypeInfo,
    listingTypes,
    listingFields,
    listingCategories,
    categoryKey,
  );

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const isNewListing = !currentListing?.id?.uuid;

      const listingData = isNewListing
        ? {...values, config}
        : {...values, id: currentListing?.id, config};

      if (isNewListing) {
        const createResponse = await dispatch(
          requestCreateListingDraft(listingData),
        ).unwrap();

        const newListingId = createResponse.data?.data.id;
        // console.log('newListingId', newListingId);

        await dispatch(requestPublishListingDraft(newListingId)).unwrap();

        setShowModal(true);
      } else {
        await dispatch(requestUpdateListing(listingData)).unwrap();
      }
    } catch (error) {
      console.error('error creating listing', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, {paddingTop: top}]}>
      <ScreenHeader
        containerStyle={{marginBottom: scale(22)}}
        leftIcon={backIcon}
        renderCenter={() => (
          <AppText style={styles.heading}>{t('Editlisting.heading')}</AppText>
        )}
      />
      <View style={styles.formWrapper}>
        {isInitialLoading ? (
          <ActivityIndicator />
        ) : (
          <EditListingDetailsForm
            initialValues={initialValues}
            listType={listingType ?? ''}
            price={price}
            selectableListingTypes={listingTypes.map((conf: any) =>
              getTransactionInfo([conf], {}, true),
            )}
            hasExistingListingType={hasExistingListingType}
            selectableCategories={listingCategories}
            pickSelectedCategories={(values: FormValues) =>
              pickCategoryFieldsForProductOrService(
                values,
                categoryKey,
                1,
                listingCategories,
              )
            }
            categoryPrefix={categoryKey}
            listingFieldsConfig={listingFields}
            inProgress={isLoading}
            onSubmit={async (values: FormValues) => {
              const {
                title,
                description = '',
                listingType,
                transactionProcessAlias,
                unitType,
                images = [],
                ...rest
              } = values;

              // Filter out images that are still uploading and remove temporary fields
              const uploadedImages = images
                .filter((img: any) => !img.isUploading && img.url)
                .map((img: any) => ({
                  id: img.id,
                  url: img.url,
                }));
              const stockValue = values?.product_available_quantity;
              const priceMayBe = values?.price
                ? {
                    price: new sdkTypes.Money(
                      values?.price * 100,
                      marketplaceCurrency,
                    ),
                  }
                : null;
              const oldStock =
                initialValues?.product_available_quantity ?? null;
              const stockMaybe = stockValue
                ? {
                    stockUpdate: {
                      oldTotal: oldStock,
                      newTotal: stockValue,
                    },
                  }
                : null;

              // const serviceDurationMaybe = values?.serviceDuration
              //   ? {
              //       serviceDuration: values?.serviceDuration,
              //       minsBetweenNextBooking: values?.minsBetweenNextBooking,
              //     }
              //   : null;

              const nestedCategories = pickCategoryFieldsForProductOrService(
                rest,
                categoryKey,
                1,
                listingCategories,
              );

              const publicListingFields = pickListingFieldsData(
                rest,
                'public',
                listingType,
                nestedCategories,
                listingFields,
              );
              const privateListingFields = pickListingFieldsData(
                rest,
                'private',
                listingType,
                nestedCategories,
                listingFields,
              );

              // New values for listing attributes
              const updateValues = {
                title: title.trim(),
                description,
                publicData: {
                  listingType,
                  transactionProcessAlias,
                  unitType,
                  ...publicListingFields,
                  // ...serviceDurationMaybe,
                  pickupEnabled: true,
                  shippingEnabled: true,
                },
                privateData: privateListingFields,
                ...setNoAvailabilityForUnbookableListings(
                  transactionProcessAlias,
                ),
                ...priceMayBe,
                ...stockMaybe,
                images: uploadedImages,
              };
              await onSubmit(updateValues);
            }}
          />
        )}
      </View>

      <ListingSuccessModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          navigation.goBack();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  formWrapper: {
    flex: 1,
  },
  heading: {
    fontSize: fontScale(18),
    color: colors.textBlack,
    ...primaryFont('500'),
  },
});
