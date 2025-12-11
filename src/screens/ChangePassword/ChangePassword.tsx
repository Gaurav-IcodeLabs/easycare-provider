import React, {useCallback} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
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
import {useTypedSelector, RootState} from '../../sharetribeSetup';
import {useToast} from '../../utils/toast';
import {sdk} from '../../sharetribeSetup';
import {backIcon, inputIcons} from '../../assets';

const GRADIENT_COLORS = [colors.deepBlue, colors.blue, colors.white];
const GRADIENT_END = {x: 0.5, y: 0.6};

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, 'ChangePassword.currentPasswordRequired'),
    newPassword: z.string().min(8, 'ChangePassword.newPasswordRequired'),
    confirmPassword: z
      .string()
      .min(8, 'ChangePassword.confirmPasswordRequired'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'ChangePassword.passwordsMustMatch',
    path: ['confirmPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const ChangePassword: React.FC = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {showToast} = useToast();
  const isRTL = I18nManager.isRTL;

  const currentUserEmail = useTypedSelector(
    (state: RootState) => state.user.currentUser?.attributes?.email,
  );

  const [isLoading, setIsLoading] = React.useState(false);

  const {control, handleSubmit, reset} = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onSubmit = useCallback(
    async (data: ChangePasswordFormData) => {
      if (!currentUserEmail) {
        showToast({
          type: 'error',
          title: t('ChangePassword.error'),
          message: t('ChangePassword.noUserEmail'),
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
          throw new Error(t('ChangePassword.incorrectCurrentPassword'));
        }

        // Change password
        await sdk.currentUser.changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        });

        showToast({
          type: 'success',
          title: t('ChangePassword.successTitle'),
          message: t('ChangePassword.successMessage'),
        });

        reset();
        navigation.goBack();
      } catch (error: any) {
        showToast({
          type: 'error',
          title: t('ChangePassword.errorTitle'),
          message: error?.message || t('ChangePassword.errorMessage'),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserEmail, navigation, reset, showToast, t],
  );

  return (
    <View style={styles.container}>
      <GradientWrapper colors={GRADIENT_COLORS} end={GRADIENT_END}>
        <ScreenHeader
          renderCenter={() => (
            <AppText style={styles.headerTitle}>
              {t('ChangePassword.heading')}
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
            <TextInputField
              control={control}
              name="currentPassword"
              labelKey="ChangePassword.currentPasswordLabel"
              placeholder="ChangePassword.currentPasswordPlaceholder"
              isPassword
              autoCapitalize="none"
              leftIcon={inputIcons.lock}
              labelStyle={styles.inputLabel}
            />

            <TextInputField
              control={control}
              name="newPassword"
              labelKey="ChangePassword.newPasswordLabel"
              placeholder="ChangePassword.newPasswordPlaceholder"
              isPassword
              autoCapitalize="none"
              leftIcon={inputIcons.lock}
              labelStyle={styles.inputLabel}
            />

            <TextInputField
              control={control}
              name="confirmPassword"
              labelKey="ChangePassword.confirmPasswordLabel"
              placeholder="ChangePassword.confirmPasswordPlaceholder"
              isPassword
              autoCapitalize="none"
              leftIcon={inputIcons.lock}
              labelStyle={styles.inputLabel}
            />
          </View>
          <Button
            title="ChangePassword.changePassword"
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
    ...primaryFont('400'),
    fontSize: scale(18),
    color: colors.white,
    lineHeight: scale(24),
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
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: scale(50),
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
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
});
