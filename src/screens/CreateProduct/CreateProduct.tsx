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
  createProductInProgressSelector,
  requestCreateProduct,
  requestUpdateProduct,
  resetCreateProduct,
  fetchProductListing,
} from '../../slices/createProduct.slice';
import {CreateProductForm} from './components/CreateProductForm';
import {useConfiguration} from '../../context';
import {types as sdkTypes} from '../../utils';
import {denormalisedResponseEntities} from '../../utils/data';

interface FormValues {
  [key: string]: any;
}

type CreateProductRouteParams = {
  CreateProduct: {
    listingId?: string;
  };
};

type CreateProductRouteProp = RouteProp<
  CreateProductRouteParams,
  'CreateProduct'
>;

export const CreateProduct: FC = () => {
  const {t} = useTranslation();
  const {top} = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<CreateProductRouteProp>();
  const config = useConfiguration() as any;
  const {showToast} = useToast();
  const createInProgress = useTypedSelector(createProductInProgressSelector);
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
  console.log('CreateProduct');

  const fetchListingData = async () => {
    try {
      setIsInitialLoading(true);
      const response = await dispatch(
        fetchProductListing({id: new sdkTypes.UUID(listingId), config}),
      ).unwrap();

      const denormalizedListings = denormalisedResponseEntities(response);
      const listing = denormalizedListings[0];
      console.log('Fetched product listing:', listing);

      if (listing) {
        const {attributes} = listing;
        const {title, description, price} = attributes;

        const images =
          listing.images?.map((img: any) => ({
            id: img.id,
            url: img.attributes?.variants?.default?.url || '',
          })) || [];

        // Get stock from currentStock relationship
        const currentStock = listing.currentStock?.attributes?.quantity || 0;

        const initialData = {
          title: title || '',
          description: description || '',
          price: price ? (price.amount / 100).toString() : '',
          stock: currentStock.toString(),
          images,
        };

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

      const imageIds =
        values.images
          ?.map((img: any) => {
            if (typeof img.id === 'string') {
              return img.id;
            }
            if (img.id?.uuid) {
              return img.id.uuid;
            }
            return null;
          })
          .filter(Boolean) || [];

      const productData = {
        title: values.title,
        description: values.description,
        price: parseFloat(values.price),
        stock: parseInt(values.stock, 10),
        images: imageIds,
      };

      console.log('Submitting product data:', productData);

      if (isEditMode) {
        const oldStockValue = parseInt(initialValues?.stock || '0', 10);
        console.log(
          'Update mode - oldStock:',
          oldStockValue,
          'newStock:',
          productData.stock,
        );

        await dispatch(
          requestUpdateProduct({
            ...productData,
            listingId: new sdkTypes.UUID(listingId),
            oldStock: oldStockValue,
          }),
        ).unwrap();

        showToast({
          type: 'success',
          title: t('CreateProduct.updateSuccess'),
          message: t('CreateProduct.updateSuccessMessage'),
        });
        navigation.goBack();
      } else {
        await dispatch(requestCreateProduct(productData)).unwrap();
        setShowModal(true);
      }
    } catch (error: any) {
      console.error(
        `Error ${isEditMode ? 'updating' : 'creating'} product:`,
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    dispatch(resetCreateProduct());
    navigation.goBack();
  };

  return (
    <View style={[styles.container, {paddingTop: top}]}>
      <ScreenHeader
        containerStyle={{marginBottom: scale(22)}}
        leftIcon={backIcon}
        renderCenter={() => (
          <AppText style={styles.heading}>
            {isEditMode
              ? t('CreateProduct.editHeading')
              : t('CreateProduct.heading')}
          </AppText>
        )}
      />
      <View style={styles.formWrapper}>
        {isInitialLoading ? (
          <ActivityIndicator />
        ) : (
          <CreateProductForm
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
