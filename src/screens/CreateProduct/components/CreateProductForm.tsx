import {StyleSheet, View} from 'react-native';
import React, {useEffect} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button, MultiImagePickField, TextInputField} from '../../../components';
import {scale} from '../../../utils';
import {colors} from '../../../constants';
import {getProductFormSchema, getDefaultProductValues} from './helper';

interface CreateProductFormProps {
  onSubmit: (values: any) => void;
  inProgress: boolean;
  initialValues?: any;
  isEditMode?: boolean;
}

export const CreateProductForm: React.FC<CreateProductFormProps> = props => {
  const {t} = useTranslation();
  const {bottom} = useSafeAreaInsets();
  const {onSubmit, inProgress, initialValues, isEditMode = false} = props;

  const {
    control,
    handleSubmit,
    formState: {isValid},
    trigger,
    reset,
  } = useForm({
    defaultValues: initialValues || getDefaultProductValues(),
    resolver: zodResolver(getProductFormSchema(t)),
    mode: 'onChange',
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

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
          <TextInputField
            control={control}
            name="title"
            labelKey="CreateProductForm.title"
            placeholder="CreateProductForm.titlePlaceholder"
          />

          <TextInputField
            control={control}
            name="description"
            labelKey="CreateProductForm.description"
            placeholder="CreateProductForm.descriptionPlaceholder"
            multiline
            inputContainerStyles={styles.descriptionInputSection}
          />

          <TextInputField
            control={control}
            name="price"
            labelKey="CreateProductForm.price"
            placeholder="CreateProductForm.pricePlaceholder"
            keyboardType="numeric"
          />

          <TextInputField
            control={control}
            name="stock"
            labelKey="CreateProductForm.stock"
            placeholder="CreateProductForm.stockPlaceholder"
            keyboardType="numeric"
            inputContainerStyles={{marginBottom: scale(16)}}
          />

          <MultiImagePickField
            control={control}
            name="images"
            labelKey="CreateProductForm.images"
            maxImages={5}
          />
        </View>
      </KeyboardAwareScrollView>

      <View style={[styles.stickyButtonContainer, {paddingBottom: bottom}]}>
        <Button
          title={
            inProgress
              ? isEditMode
                ? t('CreateProductForm.updating')
                : t('CreateProductForm.submitting')
              : isEditMode
              ? t('CreateProductForm.update')
              : t('CreateProductForm.submit')
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
    paddingBottom: scale(100),
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
});
