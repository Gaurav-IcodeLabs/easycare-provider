import {ActivityIndicator, StyleSheet, View} from 'react-native';
import React, {FC, useState} from 'react';
import {colors, primaryFont} from '../../constants';
import {ScreenHeader} from '../../components/ScreenHeader/ScreenHeader';
import {backIcon} from '../../assets';
import {AppText, ListingSuccessModal} from '../../components';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fontScale, scale} from '../../utils';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {useNavigation} from '@react-navigation/native';
import {
  createServiceInProgressSelector,
  requestCreateService,
  resetCreateService,
} from '../../slices/createService.slice';
import {
  categoriesSelector,
  subcategoriesByKeysSelector,
} from '../../slices/marketplaceData.slice';
import {CreateServiceForm} from './components/CreateServiceForm';

interface FormValues {
  [key: string]: any;
}

export const CreateService: FC = () => {
  const {t} = useTranslation();
  const {top} = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const categories = useTypedSelector(categoriesSelector);
  const subcategoriesByKeys = useTypedSelector(subcategoriesByKeysSelector);
  const createInProgress = useTypedSelector(createServiceInProgressSelector);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isLoading = createInProgress || loading;

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

      console.log('Creating service with data:', {
        ...serviceData,
        images: imageIds,
      });

      await dispatch(requestCreateService(serviceData)).unwrap();
      setShowModal(true);
    } catch (error: any) {
      console.error('Error creating service:', error);
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
        {categories.length === 0 ? (
          <ActivityIndicator />
        ) : (
          <CreateServiceForm
            categories={categories}
            subcategoriesByKeys={subcategoriesByKeys}
            inProgress={isLoading}
            onSubmit={onSubmit}
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
