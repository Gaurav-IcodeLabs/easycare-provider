import React, {useState, useMemo} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {ScreenHeader} from '../../components/ScreenHeader/ScreenHeader';
import {AppText, TextInputField, DropdownField} from '../../components';
import {backIcon} from '../../assets';
import {colors, primaryFont} from '../../constants';
import {scale, fontScale, useToast} from '../../utils';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {updateCurrentUser, updateOwnListing} from '../../slices/user.slice';

type PayoutFormData = {
  fullLegalName: string;
  bankName: string;
  iban: string;
  country: string;
};

const COUNTRIES_EN = [
  {label: 'Saudi Arabia', value: 'SA'},
  {label: 'United Arab Emirates', value: 'AE'},
  {label: 'Kuwait', value: 'KW'},
  {label: 'Bahrain', value: 'BH'},
  {label: 'Qatar', value: 'QA'},
  {label: 'Oman', value: 'OM'},
];

const COUNTRIES_AR = [
  {label: 'المملكة العربية السعودية', value: 'SA'},
  {label: 'الإمارات العربية المتحدة', value: 'AE'},
  {label: 'الكويت', value: 'KW'},
  {label: 'البحرين', value: 'BH'},
  {label: 'قطر', value: 'QA'},
  {label: 'عمان', value: 'OM'},
];

export const SetupPayout: React.FC = () => {
  const {t, i18n} = useTranslation();
  const {top, bottom} = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {showToast} = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = useTypedSelector(state => state.user.currentUser);
  const businessListingId = useTypedSelector(
    state =>
      state.user.currentUser?.attributes?.profile?.publicData
        ?.businessListingId,
  );
  const existingPayoutData = currentUser?.attributes?.profile?.protectedData
    ?.payoutDetails as PayoutFormData | undefined;

  // Create Zod schema with localized error messages
  const payoutFormSchema = useMemo(
    () =>
      z.object({
        fullLegalName: z
          .string()
          .min(1, t('SetupPayout.fullLegalNameRequired')),
        bankName: z.string().min(1, t('SetupPayout.bankNameRequired')),
        iban: z
          .string()
          .min(1, t('SetupPayout.ibanRequired'))
          .regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/, t('SetupPayout.ibanInvalid')),
        country: z.string().min(1, t('SetupPayout.countryRequired')),
      }),
    [t],
  );

  // Get localized countries based on current language
  const countries = useMemo(
    () => (i18n.language === 'ar' ? COUNTRIES_AR : COUNTRIES_EN),
    [i18n.language],
  );

  const {control, handleSubmit} = useForm<PayoutFormData>({
    resolver: zodResolver(payoutFormSchema),
    defaultValues: {
      fullLegalName: existingPayoutData?.fullLegalName || '',
      bankName: existingPayoutData?.bankName || '',
      iban: existingPayoutData?.iban || '',
      country: existingPayoutData?.country || 'SA',
    },
  });

  const onSubmit = async (data: PayoutFormData) => {
    try {
      setIsSubmitting(true);

      // Save payout details to user profile
      await dispatch(
        updateCurrentUser({
          protectedData: {
            payoutDetails: {
              fullLegalName: data.fullLegalName,
              bankName: data.bankName,
              iban: data.iban,
              country: data.country,
            },
          } as any,
        }),
      ).unwrap();

      // Update business listing with payout setup flag
      if (businessListingId) {
        await dispatch(
          updateOwnListing({
            id: businessListingId,
            // id: new types.UUID(businessListingId),
            publicData: {
              payoutSetupCompleted: true,
            },
            privateData: {
              payoutDetails: {
                fullLegalName: data.fullLegalName,
                bankName: data.bankName,
                iban: data.iban,
                country: data.country,
              },
            },
          }),
        ).unwrap();
      }

      showToast({
        type: 'success',
        title: t('SetupPayout.successTitle'),
        message: t('SetupPayout.successMessage'),
      });

      navigation.goBack();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: t('SetupPayout.errorTitle'),
        message: error.message || t('SetupPayout.errorMessage'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, {paddingTop: top}]}>
      <ScreenHeader
        containerStyle={{marginBottom: scale(16)}}
        leftIcon={backIcon}
        renderCenter={() => (
          <AppText style={styles.heading}>{t('SetupPayout.heading')}</AppText>
        )}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: bottom + scale(100)},
        ]}
        showsVerticalScrollIndicator={false}>
        <AppText style={styles.description}>
          {t('SetupPayout.description')}
        </AppText>

        <TextInputField
          control={control}
          name="fullLegalName"
          labelKey="SetupPayout.fullLegalNameLabel"
          placeholder="SetupPayout.fullLegalNamePlaceholder"
        />

        <TextInputField
          control={control}
          name="bankName"
          labelKey="SetupPayout.bankNameLabel"
          placeholder="SetupPayout.bankNamePlaceholder"
        />

        <TextInputField
          control={control}
          name="iban"
          labelKey="SetupPayout.ibanLabel"
          placeholder="SetupPayout.ibanPlaceholder"
          autoCapitalize="characters"
        />

        <DropdownField
          control={control}
          name="country"
          labelKey="SetupPayout.countryLabel"
          placeholder="SetupPayout.countryPlaceholder"
          options={countries}
        />

        <AppText style={styles.note}>{t('SetupPayout.note')}</AppText>
      </ScrollView>

      <View
        style={[styles.buttonContainer, {paddingBottom: bottom || scale(20)}]}>
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          activeOpacity={0.7}>
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <AppText style={styles.buttonText}>
              {t('SetupPayout.saveButton')}
            </AppText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  heading: {
    fontSize: fontScale(18),
    color: colors.textBlack,
    ...primaryFont('500'),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(20),
  },
  description: {
    fontSize: fontScale(14),
    color: colors.neutralDark,
    ...primaryFont('400'),
    marginBottom: scale(24),
    ...(I18nManager.isRTL && {textAlign: 'left'}),
  },
  note: {
    fontSize: fontScale(12),
    color: colors.neutralDark,
    ...primaryFont('400'),
    marginTop: scale(24),
    fontStyle: 'italic',
    ...(I18nManager.isRTL && {textAlign: 'left'}),
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(20),
    paddingTop: scale(15),
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGrey,
  },
  button: {
    height: scale(48),
    borderRadius: scale(50),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: fontScale(16),
    ...primaryFont('600'),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
