import {ActivityIndicator, StyleSheet, View} from 'react-native';
import React, {FC, useState, useEffect, useMemo} from 'react';
import {colors, primaryFont, SCREENS} from '../../constants';
import {backIcon} from '../../assets';
import {AppText, ListingSuccessModal, ScreenHeader} from '../../components';
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
import {
  getOwnListingsById,
  productCategoriesSelector,
  productSubcategoriesByKeysSelector,
  productSubsubcategoriesByKeysSelector,
} from '../../slices/marketplaceData.slice';
import {CreateProductScreenProps} from '../../apptypes';
import {serviceIdsSelector} from '../../slices/home.slice';

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
  const navigation = useNavigation<CreateProductScreenProps['navigation']>();
  const route = useRoute<CreateProductRouteProp>();
  const config = useConfiguration() as any;
  const {showToast} = useToast();
  const categories = useTypedSelector(productCategoriesSelector);
  const subcategoriesByKeys = useTypedSelector(
    productSubcategoriesByKeysSelector,
  );
  const subsubcategoriesByKeys = useTypedSelector(
    productSubsubcategoriesByKeysSelector,
  );
  const entities = useTypedSelector(state => state.marketplaceData.entities);
  const servicesIds = useTypedSelector(serviceIdsSelector);
  const services = getOwnListingsById(entities, servicesIds);
  const serviceOptions = useMemo(
    () =>
      services.map((service: any) => ({
        label: service.attributes.title,
        value: service.id.uuid,
      })),
    [services],
  );

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

  const fetchListingData = async () => {
    try {
      setIsInitialLoading(true);
      const response = await dispatch(
        fetchProductListing({id: new sdkTypes.UUID(listingId), config}),
      ).unwrap();

      const denormalizedListings = denormalisedResponseEntities(response);
      const listing = denormalizedListings[0];

      if (listing) {
        const {attributes} = listing;
        const {title, description, price, publicData} = attributes;

        const productConfig = publicData?.productConfig || {};
        const categoryId = productConfig?.category?.id || '';
        const subcategoryId = productConfig?.subcategory?.id || '';
        const subsubcategoryId = productConfig?.subsubcategory?.id || '';
        const customAttributes: Record<string, any> = {};
        if (productConfig.selectedAttributes) {
          Object.entries(productConfig.selectedAttributes).forEach(
            ([attrKey, attrValue]: [string, any]) => {
              customAttributes[attrKey] = attrValue.selectedOptions || {};
            },
          );
        }

        const images =
          listing.images?.map((img: any) => ({
            id: img.id,
            url: img.attributes?.variants?.default?.url || '',
          })) || [];

        // Get stock from currentStock relationship
        const currentStock = listing.currentStock?.attributes?.quantity || 0;

        const initialData = {
          categoryId,
          subcategoryId,
          subsubcategoryId,
          title: title || '',
          description: description || '',
          price: price ? (price.amount / 100).toString() : '',
          stock: currentStock.toString(),
          images,
          customAttributes,
          linkedServices: publicData?.linkedServices,
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

      const selectedCategory = categories.find(
        cat => cat.id === values.categoryId,
      );
      const selectedSubcategory = subcategoriesByKeys[values.subcategoryId];
      const selectedSubSubcategory =
        subsubcategoriesByKeys[values.subsubcategoryId];

      const productData = {
        categoryId: values.categoryId,
        subcategoryId: values.subcategoryId,
        subsubcategoryId: values.subsubcategoryId,
        title: values.title,
        description: values.description,
        price: parseFloat(values.price),
        stock: parseInt(values.stock, 10),
        images: imageIds,
        customAttributes: values.customAttributes || {},
        categoryConfig: selectedCategory,
        subcategoryConfig: selectedSubcategory,
        subsubcategoryConfig: selectedSubSubcategory,
        linkedServices: values.linkedServices,
      };

      if (isEditMode) {
        const oldStockValue = parseInt(initialValues?.stock || '0', 10);

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

  const handleAddProductPress = () => {
    navigation.replace(SCREENS.ADD_PRODUCT);
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
            categories={categories}
            subcategoriesByKeys={subcategoriesByKeys}
            subsubcategoriesByKeys={subsubcategoriesByKeys}
            inProgress={false}
            onSubmit={onSubmit}
            initialValues={isEditMode ? initialValues : undefined}
            isEditMode={isEditMode}
            onAddProductPress={handleAddProductPress}
            serviceOptions={serviceOptions}
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
