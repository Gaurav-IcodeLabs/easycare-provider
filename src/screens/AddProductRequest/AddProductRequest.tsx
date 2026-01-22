import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  AppText,
  Button,
  DropdownField,
  ScreenHeader,
  TextInputField,
} from '../../components';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {useTypedSelector} from '../../sharetribeSetup';
import {currentUserIdSelector} from '../../slices/user.slice';
import {
  categoriesSelector,
  productCategoriesSelector,
  productSubcategoriesByKeysSelector,
  subcategoriesByKeysSelector,
} from '../../slices/marketplaceData.slice';
import {AddServiceFormValues} from '../AddServiceRequest/helper';
import {useFieldArray, useForm} from 'react-hook-form';
import {
  getAddProductRequestSchema,
  getDefaultAddProductValues,
  ProductAttribute,
} from './helper';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  AttributeField,
  OTHER_CATEGORY_ID,
} from '../AddServiceRequest/AddServiceRequest';
import axios from 'axios';
import {ADMIN_PANEL_URL} from '@env';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {scale} from '../../utils';
import {colors, primaryFont} from '../../constants';
import {backIcon} from '../../assets';

type AddServiceRequestPayload = {
  categoryName: string;
  subcategoryName: string;
  subSubcategory: string;
  title: string;
  description: string;
  suggestedPrice: number;
  userId: string;
  isOtherCategory?: boolean;
  attributes?: ProductAttribute[];
};

export const AddProductRequest: React.FC = () => {
  const navigation = useNavigation();
  const {top, bottom} = useSafeAreaInsets();
  const {t, i18n} = useTranslation();
  const [loader, setLoader] = useState(false);
  const currentUserId = useTypedSelector(currentUserIdSelector);
  const categories = useTypedSelector(productCategoriesSelector);
  const subcategoriesByKeys = useTypedSelector(
    productSubcategoriesByKeysSelector,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isOtherCategory, setIsOtherCategory] = useState(false);

  const currentLang = i18n.language === 'ar' ? 'ar' : 'en';

  const {
    control,
    handleSubmit,
    formState: {isValid},
    watch,
    setValue,
  } = useForm<AddServiceFormValues>({
    defaultValues: getDefaultAddProductValues(),
    resolver: zodResolver(getAddProductRequestSchema(t)),
    mode: 'onChange',
  });

  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = useFieldArray({
    control,
    name: 'attributes',
  });
  const watchedCategoryId = watch('categoryId');
  const watchedSubcategoryId = watch('subcategoryId');
  const watchedSubSubcategory = watch('subSubcategory');

  // Category options with "Other" option
  const categoryOptions = [
    ...categories.map(cat => ({
      label: cat.name[currentLang] || cat.name.en,
      value: cat.id,
    })),
    {
      label: t('AddProduct.otherCategory') || 'Other',
      value: OTHER_CATEGORY_ID,
    },
  ];

  // Subcategory options based on selected category
  const subcategoryOptions =
    selectedCategoryId && selectedCategoryId !== OTHER_CATEGORY_ID
      ? categories
          .find(c => c.id === selectedCategoryId)
          ?.subcategories.map(sub => ({
            label: sub.name[currentLang] || sub.name.en,
            value: sub.id,
          })) || []
      : [];

  // Handle category change
  useEffect(() => {
    if (watchedCategoryId && watchedCategoryId !== selectedCategoryId) {
      setSelectedCategoryId(watchedCategoryId);
      setIsOtherCategory(watchedCategoryId === OTHER_CATEGORY_ID);
      setValue('subcategoryId', '');
      setValue('subSubcategory', '');
      setValue('title', '');
    }
  }, [watchedCategoryId, selectedCategoryId, setValue]);

  // Auto-fill title when sub-subcategory changes
  useEffect(() => {
    if (watchedSubSubcategory) {
      setValue('title', watchedSubSubcategory);
    }
  }, [watchedSubSubcategory, setValue]);

  const onFormSubmit = async (values: AddServiceFormValues) => {
    if (!currentUserId) {
      console.warn('User ID missing');
      return;
    }

    let categoryName = '';
    let subcategoryName = '';

    if (isOtherCategory) {
      // For "Other" category, use custom names
      categoryName = values.customCategoryName || '';
      subcategoryName = values.customSubcategoryName || '';
    } else {
      // Get names from selected category/subcategory
      const selectedCategory = categories.find(c => c.id === values.categoryId);
      categoryName =
        selectedCategory?.name[currentLang] || selectedCategory?.name.en || '';

      const selectedSubcategory =
        subcategoriesByKeys[values.subcategoryId || ''];
      subcategoryName =
        selectedSubcategory?.name[currentLang] ||
        selectedSubcategory?.name.en ||
        '';
    }

    const payload: AddServiceRequestPayload = {
      categoryName,
      subcategoryName,
      subSubcategory: values.subSubcategory,
      title: values.title,
      description: values.description,
      suggestedPrice:
        typeof values.suggestedPrice === 'string'
          ? parseFloat(values.suggestedPrice)
          : values.suggestedPrice,
      userId: currentUserId,
      // isOtherCategory,
      attributes: values.attributes || [],
    };
    // console.log('payload', JSON.stringify(payload));
    // return;

    try {
      setLoader(true);
      const result = await axios.post(
        `${ADMIN_PANEL_URL}/api/product-requests/`,
        payload,
      );
      if (result.data.success) {
        Alert.alert('', result.data.message);
        navigation.goBack();
      }
    } catch (error) {
      console.log('error', error);
      Alert.alert(
        'Error',
        'Failed to submit service request. Please try again.',
      );
    } finally {
      setLoader(false);
    }
  };

  if (categories.length === 0) {
    return (
      <View style={[styles.container, {paddingTop: top}]}>
        <ScreenHeader
          leftIcon={backIcon}
          renderCenter={() => (
            <AppText style={styles.heading}>
              {t('CreateService.heading')}
            </AppText>
          )}
        />
        <View style={styles.loadingContainer}>
          <AppText>No categories</AppText>
          {/* <ActivityIndicator size="large" color={colors.deepBlue} /> */}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, {paddingTop: top}]}>
      <ScreenHeader
        leftIcon={backIcon}
        renderCenter={() => (
          <AppText style={styles.heading}>{t('AddProduct.heading')}</AppText>
        )}
      />
      <View style={styles.wrapper}>
        <KeyboardAwareScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <DropdownField
            control={control}
            name="categoryId"
            labelKey="CreateServiceForm.category"
            placeholder="CreateServiceForm.categoryPlaceholder"
            options={categoryOptions}
          />

          {isOtherCategory ? (
            <>
              <TextInputField
                control={control}
                name="customCategoryName"
                labelKey="AddProduct.customCategoryName"
                placeholder="AddProduct.customCategoryNamePlaceholder"
              />
              <TextInputField
                control={control}
                name="customSubcategoryName"
                labelKey="AddProduct.customSubcategoryName"
                placeholder="AddProduct.customSubcategoryNamePlaceholder"
              />
            </>
          ) : (
            selectedCategoryId && (
              <DropdownField
                control={control}
                name="subcategoryId"
                labelKey="CreateServiceForm.subcategory"
                placeholder="CreateServiceForm.subcategoryPlaceholder"
                options={subcategoryOptions}
              />
            )
          )}

          {(watchedSubcategoryId || isOtherCategory) && (
            <>
              <TextInputField
                control={control}
                name="subSubcategory"
                labelKey="AddProduct.subSubcategory"
                placeholder="AddProduct.subSubcategoryPlaceholder"
              />

              <TextInputField
                control={control}
                name="description"
                labelKey="AddProduct.description"
                placeholder="AddProduct.descriptionPlaceholder"
                multiline
                inputContainerStyles={{borderRadius: scale(20)}}
              />

              <TextInputField
                control={control}
                name="suggestedPrice"
                labelKey="AddProduct.suggestedPrice"
                placeholder="AddProduct.suggestedPricePlaceholder"
                keyboardType="numeric"
              />

              {/* Attributes Section */}
              <View style={styles.attributesSection}>
                <View style={styles.attributesHeader}>
                  <AppText style={styles.attributesTitle}>
                    {t('AddProduct.attributes')}
                  </AppText>
                  <TouchableOpacity
                    style={styles.addAttributeButton}
                    onPress={() =>
                      appendAttribute({
                        name: '',
                        options: [{label: '', suggestedPrice: ''}],
                      })
                    }>
                    <AppText style={styles.addAttributeButtonText}>
                      {t('AddProduct.addAttribute')}
                    </AppText>
                  </TouchableOpacity>
                </View>

                {attributeFields.map((attribute, attributeIndex) => (
                  <AttributeField
                    key={attribute.id}
                    control={control}
                    attributeIndex={attributeIndex}
                    onRemove={() => removeAttribute(attributeIndex)}
                    t={t}
                  />
                ))}
              </View>
            </>
          )}
        </KeyboardAwareScrollView>

        <View style={[styles.stickyButtonContainer, {paddingBottom: bottom}]}>
          <Button
            title="AddProduct.button"
            onPress={handleSubmit(onFormSubmit)}
            disabled={!isValid || loader}
            loader={loader}
          />
        </View>
      </View>
    </View>
  );
};

export default AddProductRequest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  wrapper: {
    flex: 1,
    marginTop: scale(10),
    paddingHorizontal: scale(20),
  },
  heading: {
    fontSize: scale(20),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: scale(100),
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(20),
    paddingTop: scale(16),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attributesSection: {
    marginTop: scale(20),
  },
  attributesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  attributesTitle: {
    fontSize: scale(16),
    color: colors.textBlack,
    ...primaryFont('600'),
  },
  addAttributeButton: {
    backgroundColor: colors.deepBlue,
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(6),
  },
  addAttributeButtonText: {
    color: colors.white,
    fontSize: scale(12),
    ...primaryFont('500'),
  },
  attributeCard: {
    backgroundColor: colors.milkWhite,
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: scale(16),
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
  attributeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  attributeCardTitle: {
    fontSize: scale(14),
    color: colors.textBlack,
    ...primaryFont('600'),
  },
  removeButton: {
    backgroundColor: colors.red,
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: colors.white,
    fontSize: scale(16),
    ...primaryFont('600'),
  },
  optionsSection: {
    marginTop: scale(12),
  },
  optionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  optionsTitle: {
    fontSize: scale(14),
    color: colors.textBlack,
    ...primaryFont('500'),
  },
  addOptionButton: {
    backgroundColor: colors.lightGrey,
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(4),
  },
  addOptionButtonText: {
    color: colors.textBlack,
    fontSize: scale(11),
    ...primaryFont('500'),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: scale(8),
  },
  optionFields: {
    flex: 1,
    flexDirection: 'row',
    gap: scale(8),
  },
  optionLabelField: {
    flex: 2,
  },
  optionPriceField: {
    flex: 1,
  },
  removeOptionButton: {
    backgroundColor: colors.red,
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(8),
    marginBottom: scale(8),
  },
  removeOptionButtonText: {
    color: colors.white,
    fontSize: scale(12),
    ...primaryFont('600'),
  },
});
