import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Control} from 'react-hook-form';
import {
  EXTENDED_DATA_SCHEMA_TYPES,
  isFieldForCategory,
  isFieldForListingType,
} from '../../utils';

interface props {
  listingType: string;
  listingFieldsConfig: Record<string, string>[];
  selectedCategories: {
    categoryLevel1?: string;
    categoryLevel2?: string;
  };
  control: Control;
  t: (key: string) => string;
  onChangeLong?: ({}) => void;
  setValue?: (key: string, value: any) => void;
  selectedCategoryLevel2?: string;
  clearErrors?: (value: string) => void;
  setError?: (name: string, {message}: {message: string}) => void;
  onlyFieldsReturnArray?: string[];
}

export const AddListingFields: React.FC<props> = props => {
  const {
    listingType,
    listingFieldsConfig,
    selectedCategories,
    control,
    t,
    clearErrors,
    setError,
    onlyFieldsReturnArray,
  } = props;
  if (!listingType) {
    return null;
  }

  const targetCategoryIds = Object.values(selectedCategories);

  const fields = listingFieldsConfig.reduce((pickedFields, fieldConfig) => {
    const {key, schemaType, scope} = fieldConfig || {};
    const namespacedKey = scope === 'public' ? `pub_${key}` : `priv_${key}`;
    const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType);
    const isProviderScope = ['public', 'private'].includes(scope);
    const isTargetListingType = isFieldForListingType(listingType, fieldConfig);
    const isTargetCategory = isFieldForCategory(targetCategoryIds, fieldConfig);
    const shouldReturn = onlyFieldsReturnArray
      ? onlyFieldsReturnArray.includes(key)
      : true;
    return isKnownSchemaType &&
      shouldReturn &&
      isProviderScope &&
      isTargetListingType &&
      isTargetCategory
      ? [
          ...pickedFields,
          <CustomExtendedDataField
            clearErrors={clearErrors}
            setError={setError}
            key={namespacedKey}
            name={namespacedKey}
            fieldConfig={fieldConfig}
            defaultRequiredMessage={t(
              'EditListingDetailsForm.defaultRequiredMessage',
            )}
            control={control}
            t={t}
          />,
        ]
      : pickedFields;
  }, []);

  return <View>{fields}</View>;
};

const styles = StyleSheet.create({});
