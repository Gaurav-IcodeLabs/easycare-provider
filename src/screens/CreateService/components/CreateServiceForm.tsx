import {StyleSheet, View, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Button,
  MultiImagePickField,
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
} from '../../../apptypes/interfaces/serviceConfig';
import {getServiceFormSchema, getDefaultServiceValues} from './helper';

interface CreateServiceFormProps {
  categories: Category[];
  subcategoriesByKeys: Record<string, Subcategory>;
  onSubmit: (values: any) => void;
  inProgress: boolean;
  initialValues?: any;
  isEditMode?: boolean;
}

export const CreateServiceForm: React.FC<CreateServiceFormProps> = props => {
  const {t, i18n} = useTranslation();
  const {bottom} = useSafeAreaInsets();
  const {
    categories,
    subcategoriesByKeys,
    onSubmit,
    inProgress,
    initialValues,
    isEditMode = false,
  } = props;
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialValues?.categoryId || '',
  );
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<Subcategory | null>(null);

  const currentLang = i18n.language === 'ar' ? 'ar' : 'en';

  const categoryOptions = categories.map(cat => ({
    label: cat.name[currentLang] || cat.name.en,
    value: cat.id,
  }));

  const subcategoryOptions =
    selectedCategoryId && categories.find(c => c.id === selectedCategoryId)
      ? categories
          .find(c => c.id === selectedCategoryId)!
          .subcategories.map(sub => ({
            label: sub.name[currentLang] || sub.name.en,
            value: sub.id,
          }))
      : [];

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

  // Reset form when initialValues change (for edit mode)
  useEffect(() => {
    if (initialValues) {
      console.log('CreateServiceForm received initialValues:', initialValues);
      console.log('Images in initialValues:', initialValues.images);
      reset(initialValues);
      setSelectedCategoryId(initialValues.categoryId || '');
    }
  }, [initialValues, reset]);

  const watchedCategoryId = watch('categoryId');
  const watchedSubcategoryId = watch('subcategoryId');
  const watchedCustomAttributes = watch('customAttributes');

  useEffect(() => {
    if (watchedCategoryId && watchedCategoryId !== selectedCategoryId) {
      setSelectedCategoryId(watchedCategoryId);
      setValue('subcategoryId', '');
      setSelectedSubcategory(null);
      setValue('customAttributes', {});
    }
  }, [watchedCategoryId, selectedCategoryId, setValue]);

  useEffect(() => {
    if (watchedSubcategoryId) {
      const subcategory = subcategoriesByKeys[watchedSubcategoryId];
      if (subcategory) {
        setSelectedSubcategory(subcategory);
        // Only auto-fill price and duration if not in edit mode (no initialValues)
        if (!initialValues) {
          setValue('price', subcategory.basePrice.toString());
          setValue('duration', subcategory.estimatedDuration.value.toString());
          setValue('customAttributes', {});
        }
      }
    }
  }, [watchedSubcategoryId, subcategoriesByKeys, setValue, initialValues]);

  const toggleAttributeOption = (
    attributeKey: string,
    optionKey: string,
    optionData: any,
  ) => {
    const currentAttributes = watchedCustomAttributes || {};
    const newAttributes = {...currentAttributes};

    // Always allow multiple selections for providers
    if (!newAttributes[attributeKey]) {
      newAttributes[attributeKey] = {};
    }

    if (newAttributes[attributeKey][optionKey]) {
      delete newAttributes[attributeKey][optionKey];
      // Remove the attribute key if no options are selected
      if (Object.keys(newAttributes[attributeKey]).length === 0) {
        delete newAttributes[attributeKey];
      }
    } else {
      newAttributes[attributeKey][optionKey] = optionData;
    }

    setValue('customAttributes', newAttributes);
  };

  const isAttributeOptionSelected = (
    attributeKey: string,
    optionKey: string,
  ) => {
    return !!watchedCustomAttributes?.[attributeKey]?.[optionKey];
  };

  const getAttributesList = () => {
    if (!selectedSubcategory?.attributes) {
      return [];
    }
    return Object.entries(selectedSubcategory.attributes).map(
      ([key, value]: [string, any]) => ({
        key,
        data: value,
      }),
    );
  };

  const onSubmitForm = (data: any) => {
    if (isValid) {
      onSubmit(data);
    } else {
      trigger();
    }
  };

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
          />

          {selectedCategoryId && (
            <DropdownField
              control={control}
              name="subcategoryId"
              labelKey="CreateServiceForm.subcategory"
              placeholder="CreateServiceForm.subcategoryPlaceholder"
              options={subcategoryOptions}
            />
          )}

          <TextInputField
            control={control}
            name="title"
            labelKey="CreateServiceForm.title"
            placeholder="CreateServiceForm.titlePlaceholder"
          />

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

          {selectedSubcategory &&
            selectedSubcategory.locationTypes.length > 0 && (
              <DropdownField
                control={control}
                name="locationType"
                labelKey="CreateServiceForm.locationType"
                placeholder="CreateServiceForm.locationTypePlaceholder"
                options={selectedSubcategory.locationTypes.map(type => ({
                  label: type,
                  value: type,
                }))}
              />
            )}

          {selectedSubcategory &&
            selectedSubcategory.attributes &&
            Object.keys(selectedSubcategory.attributes).length > 0 && (
              <View style={styles.attributesSection}>
                <AppText style={styles.attributesTitle}>
                  {t('CreateServiceForm.additionalAttributes')}
                </AppText>
                <AppText style={styles.attributesSubtitle}>
                  {t('CreateServiceForm.selectAttributesDescription')}
                </AppText>

                {getAttributesList().map(({key, data}) => {
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
                            ]}
                            onPress={() =>
                              toggleAttributeOption(key, optionValue, option)
                            }
                            activeOpacity={0.7}>
                            <View style={styles.attributeOptionContent}>
                              <View style={styles.attributeOptionInfo}>
                                <AppText style={styles.attributeOptionName}>
                                  {optionLabel}
                                </AppText>
                              </View>
                              <View style={styles.attributeOptionRight}>
                                {priceModifier && priceModifier !== 0 && (
                                  <AppText style={styles.attributeOptionPrice}>
                                    +{selectedSubcategory.currency}{' '}
                                    {priceModifier}
                                  </AppText>
                                )}
                                <CheckBoxStandalone
                                  checked={isSelected}
                                  onPress={() =>
                                    toggleAttributeOption(
                                      key,
                                      optionValue,
                                      option,
                                    )
                                  }
                                  color={colors.deepBlue}
                                />
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            )}

          <MultiImagePickField
            control={control}
            name="images"
            labelKey="CreateServiceForm.images"
            maxImages={5}
          />
        </View>
      </KeyboardAwareScrollView>

      <View style={[styles.stickyButtonContainer, {paddingBottom: bottom}]}>
        <Button
          title={
            inProgress
              ? isEditMode
                ? t('CreateServiceForm.updating')
                : t('CreateServiceForm.submitting')
              : isEditMode
              ? t('CreateServiceForm.update')
              : t('CreateServiceForm.submit')
          }
          onPress={handleSubmit(onSubmitForm)}
          disabled={inProgress || !isValid}
          loader={inProgress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: scale(100), // Space for sticky button
  },
  container: {
    paddingHorizontal: scale(20),
    paddingTop: scale(8),
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(20),
    paddingTop: scale(16),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
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
});
