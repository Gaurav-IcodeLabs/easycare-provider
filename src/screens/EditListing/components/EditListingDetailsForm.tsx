import {StyleSheet, View} from 'react-native';
import React, {useEffect} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {getDefaultValues, getListngDetailsSchema} from './helper';
import {useTranslation} from 'react-i18next';
import {useTypedSelector} from '../../../sharetribeSetup';
import {
  entitiesSelector,
  getOwnListingsById,
} from '../../../slices/marketplaceData.slice';
import {
  listingIdSelector,
  selectedListingTypeSelector,
} from '../../../slices/editlisting.slice';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {Button, MultiImagePickField, TextInputField} from '../../../components';
import {scale} from '../../../utils';
import {colors} from '../../../constants';

interface ListingImage {
  id: {
    _sdkType: string;
    uuid: string;
  };
  url: string;
}

interface EditListingDetailsFormProps {
  listType: string;
  selectableListingTypes: any[];
  hasExistingListingType: boolean;
  selectableCategories: any[];
  initialValues: any;
  categoryPrefix: string;
  pickSelectedCategories: (values: any) => any;
  onSubmit: (values: any) => void;
  listingFieldsConfig: any[];
  price?: {amount: number; currency: string};
  inProgress: boolean;
}

export const EditListingDetailsForm: React.FC<
  EditListingDetailsFormProps
> = props => {
  const {t} = useTranslation();
  const selectedListingType = useTypedSelector(selectedListingTypeSelector);
  const listingId = useTypedSelector(listingIdSelector);
  const entities = useTypedSelector(entitiesSelector);
  const currentListing =
    listingId && listingId.uuid
      ? getOwnListingsById(entities, [listingId.uuid])[0]
      : null;

  const {
    listType: specificListingType,
    initialValues: iV,
    onSubmit,
    listingFieldsConfig,
    price,
    inProgress,
  } = props;
  // Upon changing listing type, it changes tabs accordingly and causes a re-render.
  // This re-render is resetting the entire form state. For this reason, we use the following workaround:
  // Saved the selectedListingType in redux store and used it in the form initialValues when re-render happens.
  const initialValues = selectedListingType
    ? {
        ...iV,
        listingType: selectedListingType.listingType,
        transactionProcessAlias: selectedListingType.transactionProcessAlias,
        unitType: selectedListingType.unitType,
      }
    : {
        ...iV,
        ...(specificListingType
          ? {
              listingType: specificListingType ?? '',
              transactionProcessAlias:
                specificListingType === 'product'
                  ? 'default-purchase/release-1'
                  : 'default-booking/release-1',
              unitType: specificListingType === 'product' ? 'item' : 'hour',
            }
          : {}),
      };

  const extractImageUrls = (imageArray: any[]): ListingImage[] => {
    return imageArray.map(image => ({
      id: image.id,
      url: image.attributes.variants.default.url,
    }));
  };

  const newInitialValues = {
    ...initialValues,
    ...(price && {price: `${price.amount / 100}`}),
    ...(currentListing?.images && {
      images: extractImageUrls(currentListing.images),
    }),
  };

  const {
    control,
    handleSubmit,
    formState: {isValid},
    reset,
    trigger,
  } = useForm({
    defaultValues: getDefaultValues(newInitialValues),
    resolver: zodResolver(
      getListngDetailsSchema(newInitialValues, listingFieldsConfig, t),
    ),
    mode: 'onChange',
  });

  const onSubmitForm = (data: any) => {
    if (isValid) {
      onSubmit(data);
    } else {
      trigger();
    }
  };
  const listType = initialValues?.listingType ?? '';

  useEffect(() => {
    reset(getDefaultValues(newInitialValues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listType]);

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <TextInputField
          control={control}
          name="title"
          labelKey="EditListingDetailsForm.title"
          placeholder="EditListingDetailsForm.titlePlaceholder"
        />

        <TextInputField
          control={control}
          name="description"
          labelKey="EditListingDetailsForm.description"
          placeholder="EditListingDetailsForm.descriptionPlaceholder"
          multiline
          inputContainerStyles={styles.descriptionInputSection}
        />

        <TextInputField
          control={control}
          name="price"
          labelKey="EditListingDetailsForm.price"
          placeholder="EditListingDetailsForm.pricePlaceholder"
          keyboardType="numeric"
        />

        <TextInputField
          control={control}
          name="product_available_quantity"
          labelKey="EditListingDetailsForm.stock"
          placeholder="EditListingDetailsForm.stockPlaceholder"
          keyboardType="numeric"
          returnKeyType="done"
        />

        <MultiImagePickField
          control={control}
          name="images"
          labelKey="EditListingDetailsForm.images"
          maxImages={3}
        />

        <Button
          title={
            inProgress
              ? t('EditListingDetailsForm.submitting')
              : t('EditListingDetailsForm.submit')
          }
          onPress={handleSubmit(onSubmitForm)}
          disabled={inProgress || !isValid}
          loader={inProgress}
          style={styles.submitButton}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    // backgroundColor: colors.appleGreen,
    paddingHorizontal: scale(20),
    // paddingTop: scale(4),
    paddingBottom: scale(24),
  },
  submitButton: {
    marginTop: scale(16),
    marginBottom: scale(50),
  },
  descriptionInputSection: {
    minHeight: scale(120),
    maxHeight: scale(220),
    height: undefined,
    alignItems: 'center',
    borderRadius: scale(20),
    paddingVertical: scale(10),
  },
});
