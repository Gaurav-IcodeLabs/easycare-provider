import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  TextInputField,
  MultiImagePickField,
  LocationPickerField,
} from '../../../components';
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
  onValidationChange?: (isValid: boolean) => void;
  initialValues?: any;
}

export const CreateBusinessStepOne: FC<CreateBusinessStepOneProps> = ({
  onChange,
  onValidationChange,
  initialValues,
}) => {
  const {
    control,
    watch,
    reset,
    formState: {errors, isValid},
  } = useForm<BusinessStepOneFormData>({
    resolver: zodResolver(businessStepOneSchema),
    mode: 'onChange',
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

  // Watch validation state and call onValidationChange
  React.useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

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
        render={({field: {onChange: onLocationChange, value}}) => (
          <LocationPickerField
            value={value}
            onChange={onLocationChange}
            error={errors.location?.message}
            types={['address', 'poi', 'place']}
          />
        )}
      />

      <MultiImagePickField
        control={control}
        name="images"
        maxImages={10}
        labelKey="CreateBusiness.businessPhotos"
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
