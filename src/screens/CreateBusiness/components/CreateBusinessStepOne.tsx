import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useTranslation} from 'react-i18next';
import {
  TextInputField,
  MultiImagePickField,
  AppText,
} from '../../../components';
import {colors, primaryFont} from '../../../constants';
import {scale} from '../../../utils';

const businessStepOneSchema = z.object({
  title: z.string().min(1, 'Business title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      address: z.string(),
    })
    .optional(),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  images: z.array(z.any()).min(1, 'At least one image is required'),
});

type BusinessStepOneFormData = z.infer<typeof businessStepOneSchema>;

interface CreateBusinessStepOneProps {
  inProgress: boolean;
  onSubmit: (values: any) => void;
  onChange?: (values: any) => void;
  initialValues?: any;
}

interface LocationPickerFieldProps {
  value: {lat: number; lng: number; address: string} | null | undefined;
  onChange: (location: {lat: number; lng: number; address: string}) => void;
  error?: string;
}

const LocationPickerField: FC<LocationPickerFieldProps> = ({value, error}) => {
  const {t} = useTranslation();
  const address = value?.address || 'Riyadh, Saudi Arabia';

  // TODO: Integrate with Mapbox for proper location picking
  // For now, using default location (Riyadh, Saudi Arabia)

  return (
    <View style={{marginBottom: scale(16)}}>
      <AppText
        style={{
          fontSize: scale(14),
          color: colors.textBlack,
          marginBottom: scale(8),
          ...primaryFont('500'),
        }}>
        {t('CreateBusiness.locationLabel')}
      </AppText>
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: scale(8),
          padding: scale(12),
          backgroundColor: colors.lightGray,
        }}>
        <AppText
          style={{
            fontSize: scale(14),
            color: colors.textBlack,
            textAlign: 'left',
          }}>
          {address}
        </AppText>
      </View>
      {value && (
        <AppText
          style={{
            fontSize: scale(12),
            color: colors.textGray,
            marginTop: scale(8),
          }}>
          {t('CreateBusiness.coordinates')}: {value.lat.toFixed(4)},{' '}
          {value.lng.toFixed(4)}
        </AppText>
      )}
      {error && (
        <AppText
          style={{color: colors.red, fontSize: scale(12), marginTop: scale(4)}}>
          {error}
        </AppText>
      )}
      <AppText
        style={{
          fontSize: scale(12),
          color: colors.textGray,
          marginTop: scale(8),
          fontStyle: 'italic',
        }}>
        {t('CreateBusiness.locationDefaultNote')}
      </AppText>
    </View>
  );
};

export const CreateBusinessStepOne: FC<CreateBusinessStepOneProps> = ({
  onChange,
  initialValues,
}) => {
  const {
    control,
    watch,
    reset,
    formState: {errors},
  } = useForm<BusinessStepOneFormData>({
    resolver: zodResolver(businessStepOneSchema),
    defaultValues: initialValues || {
      title: '',
      description: '',
      location: {
        lat: 24.7136,
        lng: 46.6753,
        address: 'Riyadh, Saudi Arabia',
      },
      registrationNumber: '',
      images: [],
    },
  });

  React.useEffect(() => {
    console.log('📝 StepOne initialValues:', initialValues);
    if (initialValues) {
      console.log('🔄 Resetting form with initial values');
      reset(initialValues);
    }
  }, [initialValues, reset]);

  // Watch form values and call onChange
  React.useEffect(() => {
    const subscription = watch(value => {
      if (onChange) {
        onChange(value as any);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  return (
    <View style={styles.container}>
      <TextInputField
        control={control}
        name="title"
        labelKey="CreateBusiness.businessTitle"
        placeholder="CreateBusiness.businessTitlePlaceholder"
        style={styles.inputContainer}
      />

      <TextInputField
        control={control}
        name="description"
        labelKey="CreateBusiness.description"
        placeholder="CreateBusiness.descriptionPlaceholder"
        multiline
        numberOfLines={4}
        style={styles.inputContainer}
      />

      <TextInputField
        control={control}
        name="registrationNumber"
        labelKey="CreateBusiness.registrationNumber"
        placeholder="CreateBusiness.registrationNumberPlaceholder"
        style={styles.inputContainer}
      />

      <Controller
        control={control}
        name="location"
        render={({field: {onChange, value}}) => (
          <LocationPickerField
            value={value}
            onChange={onChange}
            error={errors.location?.message}
          />
        )}
      />

      <MultiImagePickField
        control={control}
        name="images"
        maxImages={10}
        labelKey=""
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: scale(16),
  },
  inputContainer: {
    marginBottom: 0,
  },
});
