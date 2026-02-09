import {Alert, StyleSheet, View, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  AppText,
  Button,
  DropdownField,
  ScreenHeader,
  TextInputField,
} from '../../components';
import {scale} from '../../utils';
import {useTranslation} from 'react-i18next';
import {backIcon} from '../../assets';
import {colors, primaryFont} from '../../constants';
import {useForm, useFieldArray} from 'react-hook-form';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  AddServiceFormValues,
  getAddServiceRequestSchema,
  getDefaultAddServiceValues,
  ServiceAttribute,
} from './helper';
import axios from 'axios';
import {useTypedSelector} from '../../sharetribeSetup';
import {currentUserIdSelector} from '../../slices/user.slice';
import {useNavigation} from '@react-navigation/native';
import {ADMIN_PANEL_URL} from '@env';
import {
  categoriesSelector,
  subcategoriesByKeysSelector,
} from '../../slices/marketplaceData.slice';
// const ADMIN_PANEL_URL = 'http://192.168.68.118:5378';

type AddServiceRequestPayload = {
  categoryName: string;
  subcategoryName: string;
  subSubcategory: string;
  title: string;
  description: string;
  suggestedPrice: number;
  userId: string;
  isOtherCategory?: boolean;
  attributes?: ServiceAttribute[];
};

export const OTHER_CATEGORY_ID = 'other';

// AttributeField Component
interface AttributeFieldProps {
  control: any;
  attributeIndex: number;
  onRemove: () => void;
  t: any;
}

export const AttributeField: React.FC<AttributeFieldProps> = ({
  control,
  attributeIndex,
  onRemove,
  t,
}) => {
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: `attributes.${attributeIndex}.options`,
  });

  return (
    <View style={styles.attributeCard}>
      <View style={styles.attributeCardHeader}>
        <AppText style={styles.attributeCardTitle}>
          {t('AddService.attribute')} {attributeIndex + 1}
        </AppText>
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <AppText style={styles.removeButtonText}>×</AppText>
        </TouchableOpacity>
      </View>

      <TextInputField
        control={control}
        style={styles.noMarginTop}
        name={`attributes.${attributeIndex}.name`}
        placeholder="AddService.attributeNamePlaceholder"
      />

      <View style={styles.optionsSection}>
        <View style={styles.optionsHeader}>
          <AppText style={styles.optionsTitle}>
            {t('AddService.options')}
          </AppText>
          <Button
            title={t('AddService.addOption')}
            onPress={() => appendOption({label: '', suggestedPrice: 0})}
            style={styles.addOptionButtonInline}
            titleStyle={styles.addOptionButtonTitleInline}
          />
        </View>
        <View style={styles.optionsContainer}>
          {optionFields.map((option, optionIndex) => (
            <View key={option.id} style={styles.optionRow}>
              <View style={styles.optionFields}>
                <View style={styles.optionLabelField}>
                  <TextInputField
                    control={control}
                    style={styles.noMarginTop}
                    name={`attributes.${attributeIndex}.options.${optionIndex}.label`}
                    // labelKey="AddService.optionLabel"
                    placeholder="AddService.optionLabelPlaceholder"
                  />
                </View>
                <View style={styles.optionPriceField}>
                  <TextInputField
                    control={control}
                    style={styles.noMarginTop}
                    name={`attributes.${attributeIndex}.options.${optionIndex}.suggestedPrice`}
                    placeholder="AddService.optionPricePlaceholder"
                    keyboardType="numeric"
                  />
                </View>
                {optionFields.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeOptionButton}
                    onPress={() => removeOption(optionIndex)}>
                    <AppText style={styles.removeOptionButtonText}>×</AppText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export const AddServiceRequest: React.FC = () => {
  const navigation = useNavigation();
  const {top, bottom} = useSafeAreaInsets();
  const {t, i18n} = useTranslation();
  const [loader, setLoader] = useState(false);
  const currentUserId = useTypedSelector(currentUserIdSelector);
  const categories = useTypedSelector(categoriesSelector);
  const subcategoriesByKeys = useTypedSelector(subcategoriesByKeysSelector);
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
    defaultValues: getDefaultAddServiceValues(),
    resolver: zodResolver(getAddServiceRequestSchema(t)),
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
      disabled: cat.deleted, // Mark deleted categories as disabled
    })),
    {
      label: t('AddService.otherCategory') || 'Other',
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
            disabled: sub.deleted, // Mark deleted subcategories as disabled
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

    try {
      setLoader(true);
      const result = await axios.post(
        `${ADMIN_PANEL_URL}/api/service-requests/`,
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
          <AppText style={styles.heading}>{t('AddService.heading')}</AppText>
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
                labelKey="AddService.customCategoryName"
                placeholder="AddService.customCategoryNamePlaceholder"
              />
              <TextInputField
                control={control}
                name="customSubcategoryName"
                labelKey="AddService.customSubcategoryName"
                placeholder="AddService.customSubcategoryNamePlaceholder"
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
                labelKey="AddService.subSubcategory"
                placeholder="AddService.subSubcategoryPlaceholder"
              />

              <TextInputField
                control={control}
                name="description"
                labelKey="AddService.description"
                placeholder="AddService.descriptionPlaceholder"
                multiline
                inputContainerStyles={{borderRadius: scale(20)}}
              />

              <TextInputField
                control={control}
                name="suggestedPrice"
                labelKey="AddService.suggestedPrice"
                placeholder="AddService.suggestedPricePlaceholder"
                keyboardType="numeric"
              />

              {/* Attributes Section */}
              <View style={styles.attributesSection}>
                {attributeFields.map((attribute, attributeIndex) => (
                  <AttributeField
                    key={attribute.id}
                    control={control}
                    attributeIndex={attributeIndex}
                    onRemove={() => removeAttribute(attributeIndex)}
                    t={t}
                  />
                ))}
                {/* <View style={styles.attributesHeader}>
                  <AppText style={styles.attributesTitle}>
                    {t('AddService.attributes')}
                  </AppText> */}
                <Button
                  title={
                    attributeFields.length === 0
                      ? 'AddService.addAttribute'
                      : 'AddService.addMoreAttributes'
                  }
                  onPress={() =>
                    appendAttribute({
                      name: '',
                      options: [{label: '', suggestedPrice: ''}],
                    })
                  }
                  style={styles.addAttributeButton}
                />
                {/* </View> */}
              </View>
            </>
          )}
        </KeyboardAwareScrollView>

        <View style={[styles.stickyButtonContainer, {paddingBottom: bottom}]}>
          <Button
            title="AddService.button"
            onPress={handleSubmit(onFormSubmit)}
            disabled={!isValid || loader}
            loader={loader}
          />
        </View>
      </View>
    </View>
  );
};

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
    gap: scale(20),
  },
  attributesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  attributesTitle: {
    fontSize: scale(16),
    color: colors.neutralDark,
    ...primaryFont('400'),
  },
  addAttributeButton: {
    backgroundColor: colors.deepBlue,
    paddingHorizontal: scale(20),
    paddingVertical: scale(6),
    borderRadius: scale(50),
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
    gap: scale(15),
    borderColor: colors.lightGrey,
  },
  attributeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attributeCardTitle: {
    fontSize: scale(16),
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
    padding: scale(5),
  },
  optionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionsTitle: {
    fontSize: scale(16),
    color: colors.textBlack,
    ...primaryFont('600'),
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
    alignItems: 'center',
    marginBottom: scale(10),
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
    alignSelf: 'center',
  },
  removeOptionButtonText: {
    color: colors.white,
    fontSize: scale(12),
    ...primaryFont('600'),
  },
  noMarginTop: {
    marginTop: 0,
  },
  addOptionButtonInline: {
    height: scale(30),
    borderRadius: scale(8),
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
  },
  addOptionButtonTitleInline: {
    fontSize: scale(12),
    ...primaryFont('400'),
  },
  optionsContainer: {
    marginVertical: scale(10),
  },
});
