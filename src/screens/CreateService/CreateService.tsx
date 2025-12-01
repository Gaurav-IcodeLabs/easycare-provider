import {ActivityIndicator, StyleSheet, View} from 'react-native';
import React, {FC, useState, useEffect} from 'react';
import {colors, primaryFont} from '../../constants';
import {ScreenHeader} from '../../components/ScreenHeader/ScreenHeader';
import {backIcon} from '../../assets';
import {AppText, ListingSuccessModal} from '../../components';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fontScale, scale, useToast} from '../../utils';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {
  createServiceInProgressSelector,
  requestCreateService,
  requestUpdateService,
  resetCreateService,
  fetchServiceListing,
} from '../../slices/createService.slice';
import {
  categoriesSelector,
  subcategoriesByKeysSelector,
} from '../../slices/marketplaceData.slice';
import {CreateServiceForm} from './components/CreateServiceForm';
import {useConfiguration} from '../../context';
import {types as sdkTypes} from '../../utils';
import {denormalisedResponseEntities} from '../../utils/data';

interface FormValues {
  [key: string]: any;
}

type CreateServiceRouteParams = {
  CreateService: {
    listingId?: string;
  };
};

type CreateServiceRouteProp = RouteProp<
  CreateServiceRouteParams,
  'CreateService'
>;

export const CreateService: FC = () => {
  const {t} = useTranslation();
  const {top} = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<CreateServiceRouteProp>();
  const config = useConfiguration() as any;
  const {showToast} = useToast();
  const categories = useTypedSelector(categoriesSelector);
  const subcategoriesByKeys = useTypedSelector(subcategoriesByKeysSelector);
  const createInProgress = useTypedSelector(createServiceInProgressSelector);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<any>(null);

  const listingId = route.params?.listingId;
  const isEditMode = !!listingId;
  const isLoading = createInProgress || loading || isInitialLoading;

  useEffect(() => {
    if (listingId) {
      fetchListingData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  const fetchListingData = async () => {
    try {
      setIsInitialLoading(true);
      const response = await dispatch(
        fetchServiceListing({id: new sdkTypes.UUID(listingId), config}),
      ).unwrap();

      console.log('Fetch service listing response:', response);

      // Denormalize the response to get listing with images included
      const denormalizedListings = denormalisedResponseEntities(response);
      const listing = denormalizedListings[0];
      console.log('Denormalized listing:', listing);

      if (listing) {
        const {attributes} = listing;
        const {publicData, title, description, price} = attributes;

        console.log('Listing publicData:', publicData);

        // Extract service data from publicData
        const serviceConfig = publicData?.serviceConfig || {};
        const categoryId = serviceConfig?.category?.id || '';
        const subcategoryId = serviceConfig?.subcategory?.id || '';

        // Extract images - they should be in listing.images after denormalization
        console.log('Listing.images:', listing.images);

        const images =
          listing.images?.map((img: any) => {
            console.log('Processing image:', img);
            return {
              id: img.id, // Keep the full id object with uuid and _sdkType
              url: img.attributes?.variants?.default?.url || '',
            };
          }) || [];

        console.log('Extracted images:', JSON.stringify(images, null, 2));

        // Extract custom attributes
        const customAttributes: Record<string, any> = {};
        if (serviceConfig.selectedAttributes) {
          Object.entries(serviceConfig.selectedAttributes).forEach(
            ([attrKey, attrValue]: [string, any]) => {
              customAttributes[attrKey] = attrValue.selectedOptions || {};
            },
          );
        }

        console.log('Extracted customAttributes:', customAttributes);

        const initialData = {
          categoryId,
          subcategoryId,
          title: title || '',
          description: description || '',
          price: price ? (price.amount / 100).toString() : '',
          duration: publicData?.duration?.toString() || '',
          locationType: publicData?.locationType || '',
          customAttributes,
          images,
        };

        console.log('Setting initial values:', initialData);
        setInitialValues(initialData);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      // Extract image UUIDs from the uploaded images
      const imageIds =
        values.images
          ?.map((img: any) => {
            // Handle different image ID formats
            if (typeof img.id === 'string') {
              return img.id;
            }
            if (img.id?.uuid) {
              return img.id.uuid;
            }
            return null;
          })
          .filter(Boolean) || [];

      // Get the selected category and subcategory config
      const selectedCategory = categories.find(
        cat => cat.id === values.categoryId,
      );
      const selectedSubcategory = subcategoriesByKeys[values.subcategoryId];

      const serviceData = {
        categoryId: values.categoryId,
        subcategoryId: values.subcategoryId,
        title: values.title,
        description: values.description,
        price: parseFloat(values.price),
        duration: parseInt(values.duration, 10),
        locationType: values.locationType,
        images: imageIds,
        customAttributes: values.customAttributes || {},
        categoryConfig: selectedCategory,
        subcategoryConfig: selectedSubcategory,
      };

      if (isEditMode) {
        // Update existing service
        console.log('Updating service with data:', {
          ...serviceData,
          listingId,
          images: imageIds,
        });

        await dispatch(
          requestUpdateService({
            ...serviceData,
            listingId: new sdkTypes.UUID(listingId),
          }),
        ).unwrap();

        // Show success toast and navigate back
        showToast({
          type: 'success',
          title: t('CreateService.updateSuccess'),
          message: t('CreateService.updateSuccessMessage'),
        });
        navigation.goBack();
      } else {
        // Create new service
        console.log('Creating service with data:', {
          ...serviceData,
          images: imageIds,
        });

        await dispatch(requestCreateService(serviceData)).unwrap();
        setShowModal(true);
      }
    } catch (error: any) {
      console.error(
        `Error ${isEditMode ? 'updating' : 'creating'} service:`,
        error,
      );
      console.error('Error details:', error.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    dispatch(resetCreateService());
    navigation.goBack();
  };

  return (
    <View style={[styles.container, {paddingTop: top}]}>
      <ScreenHeader
        containerStyle={{marginBottom: scale(22)}}
        leftIcon={backIcon}
        renderCenter={() => (
          <AppText style={styles.heading}>{t('CreateService.heading')}</AppText>
        )}
      />
      <View style={styles.formWrapper}>
        {categories.length === 0 || (isEditMode && !initialValues) ? (
          <ActivityIndicator />
        ) : (
          <CreateServiceForm
            categories={categories}
            subcategoriesByKeys={subcategoriesByKeys}
            inProgress={isLoading}
            onSubmit={onSubmit}
            initialValues={isEditMode ? initialValues : undefined}
            isEditMode={isEditMode}
          />
        )}
      </View>

      <ListingSuccessModal visible={showModal} onClose={handleModalClose} />
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
