import React, {useCallback} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  I18nManager,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {
  AppText,
  Button,
  GradientWrapper,
  ScreenHeader,
  TextInputField,
} from '../../components';
import {colors, primaryFont} from '../../constants';
import {scale} from '../../utils';
import {
  useTypedSelector,
  RootState,
  useAppDispatch,
} from '../../sharetribeSetup';
import {useToast} from '../../utils/toast';
import {sdk} from '../../sharetribeSetup';
import {backIcon, inputIcons} from '../../assets';
import {changeUserEmail} from '../../slices/user.slice';

const GRADIENT_COLORS = [
  colors.deepBlue,
  colors.deepBlue,
  colors.blue,
  colors.white,
];
const GRADIENT_END = {x: 0.5, y: 0.6};

const changeEmailSchema = z.object({
  currentPassword: z.string().min(8, 'ChangeEmail.currentPasswordRequired'),
  newEmail: z.string().email('ChangeEmail.invalidEmail'),
});

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

export const ChangeEmail: React.FC = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {showToast} = useToast();
  const dispatch = useAppDispatch();
  const isRTL = I18nManager.isRTL;

  const currentUserEmail = useTypedSelector(
    (state: RootState) => state.user.currentUser?.attributes?.email,
  );

  const [isLoading, setIsLoading] = React.useState(false);

  const {control, handleSubmit, reset} = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      currentPassword: '',
      newEmail: '',
    },
  });

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onSubmit = useCallback(
    async (data: ChangeEmailFormData) => {
      if (!currentUserEmail) {
        showToast({
          type: 'error',
          title: t('ChangeEmail.error'),
          message: t('ChangeEmail.noUserEmail'),
        });
        return;
      }

      if (data.newEmail === currentUserEmail) {
        showToast({
          type: 'error',
          title: t('ChangeEmail.error'),
          message: t('ChangeEmail.sameEmailError'),
        });
        return;
      }

      setIsLoading(true);

      try {
        // Verify current password by attempting to login
        try {
          await sdk.login({
            username: currentUserEmail,
            password: data.currentPassword,
          });
        } catch (loginError: any) {
          setIsLoading(false);
          showToast({
            type: 'error',
            title: t('ChangeEmail.errorTitle'),
            message: t('ChangeEmail.incorrectCurrentPassword'),
          });
          return;
        }

        // Change email using thunk
        await dispatch(
          changeUserEmail({
            currentPassword: data.currentPassword,
            email: data.newEmail,
          }),
        ).unwrap();

        showToast({
          type: 'success',
          title: t('ChangeEmail.successTitle'),
          message: t('ChangeEmail.successMessage'),
        });

        reset();
        navigation.goBack();
      } catch (error: any) {
        // Handle specific Sharetribe API errors from thunk rejection
        let errorMessage = t('ChangeEmail.errorMessage');

        if (error?.status === 403) {
          errorMessage = t('ChangeEmail.incorrectCurrentPassword');
        } else if (error?.status === 409) {
          errorMessage = t('ChangeEmail.emailAlreadyInUse');
        } else if (error?.status === 422) {
          errorMessage = t('ChangeEmail.invalidEmailFormat');
        } else if (error?.message) {
          errorMessage = error.message;
        }

        showToast({
          type: 'error',
          title: t('ChangeEmail.errorTitle'),
          message: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserEmail, dispatch, navigation, reset, showToast, t],
  );

  return (
    <View style={styles.container}>
      <GradientWrapper colors={GRADIENT_COLORS} end={GRADIENT_END}>
        <ScreenHeader
          renderCenter={() => (
            <AppText style={styles.headerTitle}>
              {t('ChangeEmail.heading')}
            </AppText>
          )}
          renderLeft={() => (
            <TouchableOpacity onPress={handleBackPress}>
              <Image
                source={backIcon}
                style={[styles.backIcon, isRTL && {transform: [{scaleX: -1}]}]}
              />
            </TouchableOpacity>
          )}
          containerStyle={styles.headerContainer}
        />

        <View style={styles.contentSection}>
          <View style={styles.formContainer}>
            <View style={styles.infoContainer}>
              <AppText style={[styles.infoLabel, styles.inputLabel]}>
                {t('ChangeEmail.currentEmailLabel')}
              </AppText>
              <AppText style={styles.infoValue}>{currentUserEmail}</AppText>
            </View>

            <TextInputField
              control={control}
              name="newEmail"
              labelKey="ChangeEmail.newEmailLabel"
              placeholder="ChangeEmail.newEmailPlaceholder"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={inputIcons.email}
              labelStyle={styles.inputLabel}
            />

            <TextInputField
              control={control}
              name="currentPassword"
              labelKey="ChangeEmail.currentPasswordLabel"
              placeholder="ChangeEmail.currentPasswordPlaceholder"
              isPassword
              autoCapitalize="none"
              leftIcon={inputIcons.lock}
              labelStyle={styles.inputLabel}
            />
          </View>
          <Button
            title="ChangeEmail.changeEmail"
            onPress={handleSubmit(onSubmit)}
            loader={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
          />
        </View>
      </GradientWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
  },
  headerTitle: {
    fontSize: scale(18),
    lineHeight: scale(24),
    ...primaryFont('400'),
    color: colors.white,
  },
  contentSection: {
    flexGrow: 1,
    paddingTop: scale(20),
    paddingHorizontal: scale(20),
    paddingBottom: scale(40),
    justifyContent: 'space-between',
    borderColor: colors.borderGray,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: scale(16),
    padding: scale(20),
  },
  infoContainer: {
    marginBottom: scale(20),
    paddingBottom: scale(16),
    borderBottomWidth: scale(1),
    borderBottomColor: colors.lightGrey,
    ...(I18nManager.isRTL && {alignItems: 'flex-start'}),
  },
  infoLabel: {
    fontSize: scale(14),
    color: colors.neutralDark,
    marginBottom: scale(8),
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  infoValue: {
    fontSize: scale(16),
    color: colors.textBlack,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: scale(24),
  },
  backIcon: {
    tintColor: colors.white,
    height: scale(24),
    width: scale(24),
  },
  inputLabel: {
    ...primaryFont('400'),
    color: colors.deepBlue,
    fontSize: scale(16),
    lineHeight: scale(24),
  },
});
