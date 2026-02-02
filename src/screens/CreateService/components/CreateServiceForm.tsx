import {StyleSheet, View, TouchableOpacity} from 'react-native';
import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Button,
  // MultiImagePickField,
  TextInputField,
  AppText,
  CheckBoxStandalone,
} from '../../../components';
import {DropdownField} from '../../../components/DropdownField/DropdownField';
import {scale} from '../../../utils';
import {colors, primaryFont} from '../../../constants';

import {
  Category,
  Subcategory,
  SubSubCategory,
} from '../../../apptypes/interfaces/serviceConfig';
import {getServiceFormSchema, getDefaultServiceValues} from './helper';
import {useStatusBar} from '../../../hooks';

interface CreateServiceFormProps {
  categories: Category[];
  subcategoriesByKeys: Record<string, Subcategory>;
  subsubcategoriesByKeys: Record<string, SubSubCategory>;
  onSubmit: (values: any) => void;
  onChange?: (values: any) => void;
  onValidationChange?: (isValid: boolean) => void;
  inProgress: boolean;
  initialValues?: any;
  isEditMode?: boolean;
  onAddServicePress: () => void;
}

export const CreateServiceForm: React.FC<CreateServiceFormProps> = props => {
  const {t, i18n} = useTranslation();
  const {bottom} = useSafeAreaInsets();
  const {
    categories,
    subcategoriesByKeys,
    subsubcategoriesByKeys,
    onSubmit,
    onChange,
    onValidationChange,
    inProgress,
    initialValues,
    isEditMode = false,
    onAddServicePress,
  } = props;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialValues?.categoryId || '',
  );

  const [selectedSubcategory, setSelectedSubcategory] =
    useState<Subcategory | null>(null);
  const [selectedSubSubcategory, setSelectedSubSubcategory] =
    useState<SubSubCategory | null>(null);
  useStatusBar('dark-content');

  const currentLang = i18n.language === 'ar' ? 'ar' : 'en';

  // Memoized options for better performance
  const categoryOptions = useMemo(
    () =>
      categories.map(cat => ({
        label: cat.name[currentLang] || cat.name.en,
        value: cat.id,
      })),
    [categories, currentLang],
  );

  const subcategoryOptions = useMemo(() => {
    if (!selectedCategoryId) return [];
    const category = categories.find(c => c.id === selectedCategoryId);
    return category
      ? category.subcategories.map(sub => ({
          label: sub.name[currentLang] || sub.name.en,
          value: sub.id,
        }))
      : [];
  }, [selectedCategoryId, categories, currentLang]);

  const subsubcategoryOptions = useMemo(() => {
    if (!selectedSubcategory?.subSubcategories) return [];
    return selectedSubcategory.subSubcategories.map(subSub => ({
      label: subSub.name[currentLang] || subSub.name.en,
      value: subSub.id,
    }));
  }, [selectedSubcategory, currentLang]);

  const {
    control,
    handleSubmit,
    formState: {isValid},
    watch,
    setValue,
    trigger,
    reset,
  } = useForm({
    defaultValues: initialValues || getDefaultServiceValues(),
    resolver: zodResolver(getServiceFormSchema(t)),
    mode: 'onChange',
  });

  // Watch form values
  const watchedCategoryId = watch('categoryId');
  const watchedSubcategoryId = watch('subcategoryId');
  const watchedSubSubcategoryId = watch('subsubcategoryId');
  const watchedCustomAttributes = watch('customAttributes');
  const watchedValues = watch();

  // Call onChange when form values change
  React.useEffect(() => {
    if (onChange) {
      onChange(watchedValues);
    }
  }, [watchedValues, onChange]);

  // Call onValidationChange when validation state changes
  React.useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  // Reset form when initialValues change (for edit mode)
  useEffect(() => {
    if (initialValues) {
      if (initialValues.categoryId) {
        setSelectedCategoryId(initialValues.categoryId);
      }
      if (initialValues.subcategoryId) {
        const subcategory = subcategoriesByKeys[initialValues.subcategoryId];
        if (subcategory) {
          setSelectedSubcategory(subcategory);
        }
      }
      if (initialValues.subsubcategoryId) {
        const subsubcategory =
          subsubcategoriesByKeys[initialValues.subsubcategoryId];
        if (subsubcategory) {
          setSelectedSubSubcategory(subsubcategory);
        }
      }

      reset(initialValues);
    }
  }, [initialValues, reset, subcategoriesByKeys, subsubcategoriesByKeys]);

  // Handle category selection
  useEffect(() => {
    if (watchedCategoryId && watchedCategoryId !== selectedCategoryId) {
      setSelectedCategoryId(watchedCategoryId);
      setValue('subcategoryId', '');
      setValue('subsubcategoryId', '');
      setValue('title', '');
      setSelectedSubcategory(null);
      setSelectedSubSubcategory(null);
      setValue('customAttributes', {});
    }
  }, [watchedCategoryId, selectedCategoryId, setValue]);

  // CHANGED: Handle subcategory selection
  // Only reset child fields when user actively changes selection, not during init
  useEffect(() => {
    if (watchedSubcategoryId) {
      const subcategory = subcategoriesByKeys[watchedSubcategoryId];
      if (subcategory) {
        setSelectedSubcategory(subcategory);

        // CHANGED: Only clear subsubcategory if this is NOT the initial load
        // or if the subcategory actually changed from what was initially set
        const isInitialValue =
          initialValues?.subcategoryId === watchedSubcategoryId;

        if (!isInitialValue) {
          setValue('subsubcategoryId', '');
          setValue('title', '');
          setSelectedSubSubcategory(null);
          setValue('customAttributes', {});
        }
      }
    }
  }, [watchedSubcategoryId, subcategoriesByKeys, setValue, initialValues]);

  // CHANGED: Handle sub-subcategory selection and auto-set title
  // Only auto-fill when user actively selects, not during initialization
  useEffect(() => {
    if (watchedSubSubcategoryId) {
      const subSubcategory = subsubcategoriesByKeys[watchedSubSubcategoryId];
      if (subSubcategory) {
        setSelectedSubSubcategory(subSubcategory);

        // CHANGED: Only auto-set values if this is NOT the initial load
        const isInitialValue =
          initialValues?.subsubcategoryId === watchedSubSubcategoryId;

        if (!isInitialValue) {
          // Auto-set title from sub-subcategory name
          const title =
            subSubcategory.name[currentLang] || subSubcategory.name.en;
          setValue('title', title);

          // Only auto-fill price and duration if not in edit mode
          if (!initialValues) {
            setValue('price', subSubcategory.basePrice.toString());
            setValue(
              'duration',
              subSubcategory.estimatedDuration.value.toString(),
            );
            setValue('customAttributes', {});
          }
        }
      }
    }
  }, [
    watchedSubSubcategoryId,
    subsubcategoriesByKeys,
    currentLang,
    initialValues,
    setValue,
  ]);

  // Memoized attribute functions for better performance
  const toggleAttributeOption = useCallback(
    (attributeKey: string, optionKey: string, optionData: any) => {
      const currentAttributes = watchedCustomAttributes || {};
      const newAttributes = {...currentAttributes};

      if (!newAttributes[attributeKey]) {
        newAttributes[attributeKey] = {};
      }

      if (newAttributes[attributeKey][optionKey]) {
        delete newAttributes[attributeKey][optionKey];
        if (Object.keys(newAttributes[attributeKey]).length === 0) {
          delete newAttributes[attributeKey];
        }
      } else {
        newAttributes[attributeKey][optionKey] = optionData;
      }

      setValue('customAttributes', newAttributes);
    },
    [watchedCustomAttributes, setValue],
  );

  const isAttributeOptionSelected = useCallback(
    (attributeKey: string, optionKey: string) => {
      return !!watchedCustomAttributes?.[attributeKey]?.[optionKey];
    },
    [watchedCustomAttributes],
  );

  const getAttributesList = useMemo(() => {
    if (!selectedSubSubcategory?.attributes) {
      return [];
    }
    return Object.entries(selectedSubSubcategory.attributes).map(
      ([key, value]: [string, any]) => ({
        key,
        data: value,
      }),
    );
  }, [selectedSubSubcategory?.attributes]);

  const onSubmitForm = useCallback(
    (data: any) => {
      if (isValid) {
        onSubmit(data);
      } else {
        trigger();
      }
    },
    [isValid, onSubmit, trigger],
  );

  return (
    <View style={styles.wrapper}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <DropdownField
            control={control}
            name="categoryId"
            labelKey="CreateServiceForm.category"
            placeholder="CreateServiceForm.categoryPlaceholder"
            options={categoryOptions}
            disabled={isEditMode}
          />

          {selectedCategoryId && (
            <DropdownField
              control={control}
              name="subcategoryId"
              labelKey="CreateServiceForm.subcategory"
              placeholder="CreateServiceForm.subcategoryPlaceholder"
              options={subcategoryOptions}
              disabled={isEditMode}
            />
          )}

          {selectedSubcategory && (
            <DropdownField
              control={control}
              name="subsubcategoryId"
              labelKey="CreateServiceForm.subsubcategory"
              placeholder="CreateServiceForm.subsubcategoryPlaceholder"
              options={subsubcategoryOptions}
              disabled={isEditMode}
            />
          )}

          <TextInputField
            control={control}
            name="description"
            labelKey="CreateServiceForm.description"
            placeholder="CreateServiceForm.descriptionPlaceholder"
            multiline
            inputContainerStyles={styles.descriptionInputSection}
          />

          <TextInputField
            control={control}
            name="price"
            labelKey="CreateServiceForm.price"
            placeholder="CreateServiceForm.pricePlaceholder"
            keyboardType="numeric"
            editable={false}
            inputContainerStyles={styles.disabledInput}
          />

          <TextInputField
            control={control}
            name="duration"
            labelKey="CreateServiceForm.duration"
            placeholder="CreateServiceForm.durationPlaceholder"
            keyboardType="numeric"
            editable={!isEditMode}
            inputContainerStyles={isEditMode ? styles.disabledInput : undefined}
          />

          {selectedSubSubcategory &&
            selectedSubSubcategory.locationTypes.length > 0 && (
              <DropdownField
                control={control}
                name="locationType"
                labelKey="CreateServiceForm.locationType"
                placeholder="CreateServiceForm.locationTypePlaceholder"
                options={selectedSubSubcategory.locationTypes.map(type => ({
                  label: type,
                  value: type,
                }))}
                disabled={isEditMode}
              />
            )}

          {selectedSubSubcategory &&
            selectedSubSubcategory.attributes &&
            Object.keys(selectedSubSubcategory.attributes).length > 0 && (
              <View style={styles.attributesSection}>
                <AppText style={styles.attributesTitle}>
                  {t('CreateServiceForm.additionalAttributes')}
                </AppText>
                <AppText style={styles.attributesSubtitle}>
                  {t('CreateServiceForm.selectAttributesDescription')}
                </AppText>

                {getAttributesList.map(
                  ({key, data}: {key: string; data: any}) => {
                    const attributeType =
                      data.type === 'select' ? 'single' : 'multiple';
                    const isRequired = data.required || false;
                    const attributeName =
                      data.label?.[currentLang] || data.label?.en || key;
                    const options = data.options || [];

                    return (
                      <View key={key} style={styles.attributeGroup}>
                        <View style={styles.attributeHeader}>
                          <View style={styles.attributeTitleRow}>
                            <AppText style={styles.attributeGroupName}>
                              {attributeName}
                            </AppText>
                            {isRequired && (
                              <AppText style={styles.requiredBadge}>
                                {t('CreateServiceForm.required')}
                              </AppText>
                            )}
                          </View>
                        </View>
                        <View style={styles.attributeTypeContainer}>
                          <AppText style={styles.attributeType}>
                            {t('CreateServiceForm.selectMultiple')}
                          </AppText>
                          {attributeType === 'single' && (
                            <AppText style={styles.attributeTypeNote}>
                              ({t('CreateServiceForm.customerSelectsOne')})
                            </AppText>
                          )}
                        </View>

                        {options.map((option: any, index: number) => {
                          const optionValue = option.value;
                          const isSelected = isAttributeOptionSelected(
                            key,
                            optionValue,
                          );
                          const optionLabel =
                            option.label?.[currentLang] ||
                            option.label?.en ||
                            optionValue;
                          const priceModifier = option.priceModifier;

                          return (
                            <TouchableOpacity
                              key={`${optionValue}-${index}`}
                              style={[
                                styles.attributeOption,
                                isSelected && styles.attributeOptionSelected,
                                isEditMode && styles.attributeOptionDisabled,
                              ]}
                              onPress={() =>
                                !isEditMode &&
                                toggleAttributeOption(key, optionValue, option)
                              }
                              activeOpacity={isEditMode ? 1 : 0.7}
                              disabled={isEditMode}>
                              <View style={styles.attributeOptionContent}>
                                <View style={styles.attributeOptionInfo}>
                                  <AppText
                                    style={[
                                      styles.attributeOptionName,
                                      isEditMode && styles.disabledText,
                                    ]}>
                                    {optionLabel}
                                  </AppText>
                                </View>
                                <View style={styles.attributeOptionRight}>
                                  {priceModifier && priceModifier !== 0 && (
                                    <AppText
                                      style={[
                                        styles.attributeOptionPrice,
                                        isEditMode && styles.disabledText,
                                      ]}>
                                      +{selectedSubSubcategory.currency}{' '}
                                      {priceModifier}
                                    </AppText>
                                  )}
                                  <CheckBoxStandalone
                                    checked={isSelected}
                                    onPress={() =>
                                      !isEditMode &&
                                      toggleAttributeOption(
                                        key,
                                        optionValue,
                                        option,
                                      )
                                    }
                                    color={colors.deepBlue}
                                    disabled={isEditMode}
                                  />
                                </View>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    );
                  },
                )}
              </View>
            )}

          {/* <MultiImagePickField
            control={control}
            name="images"
            labelKey="CreateServiceForm.images"
            maxImages={5}
          /> */}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: scale(20), // Reduced padding since no sticky button
  },
  container: {
    // paddingHorizontal: scale(20),
    // paddingTop: scale(8),
  },
  descriptionInputSection: {
    minHeight: scale(120),
    maxHeight: scale(220),
    height: undefined,
    alignItems: 'center',
    borderRadius: scale(20),
    paddingVertical: scale(10),
  },
  disabledInput: {
    marginBottom: scale(16),
    backgroundColor: colors.milkWhite,
    borderColor: colors.lightGrey,
  },
  attributesSection: {
    marginTop: scale(16),
  },
  attributesTitle: {
    fontSize: scale(16),
    color: colors.neutralDark,
    ...primaryFont('500'),
    marginBottom: scale(4),
  },
  attributesSubtitle: {
    fontSize: scale(14),
    color: colors.grey,
    ...primaryFont('400'),
    marginBottom: scale(12),
  },
  attributeGroup: {
    marginBottom: scale(20),
    borderWidth: scale(1),
    borderColor: colors.lightGrey,
    borderRadius: scale(12),
    padding: scale(16),
    backgroundColor: colors.white,
  },
  attributeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  attributeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: scale(8),
    flexWrap: 'wrap',
  },
  attributeGroupName: {
    fontSize: scale(16),
    color: colors.textBlack,
    ...primaryFont('600'),
  },
  requiredBadge: {
    fontSize: scale(11),
    color: colors.red,
    ...primaryFont('600'),
    backgroundColor: '#FFE5E5',
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: scale(4),
  },
  attributeTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    flexWrap: 'wrap',
    marginBottom: scale(12),
  },
  attributeType: {
    fontSize: scale(12),
    color: colors.deepBlue,
    ...primaryFont('500'),
    backgroundColor: colors.milkWhite,
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(6),
  },
  attributeTypeNote: {
    fontSize: scale(11),
    color: colors.grey,
    ...primaryFont('400'),
  },
  attributeGroupDescription: {
    fontSize: scale(13),
    color: colors.grey,
    ...primaryFont('400'),
    marginBottom: scale(12),
  },
  attributeOption: {
    borderWidth: scale(1),
    borderColor: colors.lightGrey,
    borderRadius: scale(8),
    padding: scale(12),
    marginBottom: scale(8),
    backgroundColor: colors.white,
  },
  attributeOptionSelected: {
    borderColor: colors.deepBlue,
    backgroundColor: colors.milkWhite,
  },
  attributeOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attributeOptionInfo: {
    flex: 1,
    marginRight: scale(12),
  },
  attributeOptionName: {
    fontSize: scale(15),
    color: colors.textBlack,
    ...primaryFont('500'),
    marginBottom: scale(2),
  },
  attributeOptionDescription: {
    fontSize: scale(12),
    color: colors.grey,
    ...primaryFont('400'),
  },
  attributeOptionRight: {
    alignItems: 'flex-end',
    gap: scale(6),
  },
  attributeOptionPrice: {
    fontSize: scale(14),
    color: colors.deepBlue,
    ...primaryFont('600'),
  },
  attributeOptionDisabled: {
    backgroundColor: colors.milkWhite,
    borderColor: colors.lightGrey,
    opacity: 0.6,
  },
  disabledText: {
    color: colors.grey,
  },
});
