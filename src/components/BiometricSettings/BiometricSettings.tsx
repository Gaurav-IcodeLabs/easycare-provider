import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Switch,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {
  currentUserEmailSelector,
  hasIdentityProvidersSelector,
} from '../../slices/user.slice';
import {
  disableBiometricLogin,
  enableBiometricLogin,
  getBiometryTypeName,
  isBiometricAvailable,
  isBiometricEnabled,
  scale,
  useToast,
  verifyBiometricAuthentication,
} from '../../utils';
import {updateAppState} from '../../slices/app.slice';
import {login} from '../../slices/auth.slice';
import {AppText} from '../AppText/AppText';
import {colors, primaryFont} from '../../constants';
import {TextInputField} from '../TextInputField/TextInputField';

interface CredentialsFormValues {
  password: string;
}

export const BiometricSettings: React.FC = () => {
  const {t} = useTranslation();
  const {showToast} = useToast();
  const dispatch = useAppDispatch();
  const currentUserEmail = useTypedSelector(currentUserEmailSelector);
  const hasIdentityProviders = useTypedSelector(hasIdentityProvidersSelector);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];

  const credentialsSchema = z.object({
    password: z.string().min(1, t('BiometricSettings.passwordRequired')),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: {isValid},
  } = useForm<CredentialsFormValues>({
    defaultValues: {
      password: '',
    },
    resolver: zodResolver(credentialsSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  useEffect(() => {
    if (showModal) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showModal, fadeAnim]);

  const checkBiometricStatus = async () => {
    const {available, biometryType} = await isBiometricAvailable();
    const typeName = getBiometryTypeName(biometryType);

    setBiometricAvailable(available);
    setBiometricType(typeName);

    if (available) {
      const enabled = await isBiometricEnabled();
      setBiometricEnabled(enabled);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (loading) {
      return;
    }

    if (!value) {
      // Disable biometric
      setLoading(true);
      try {
        await disableBiometricLogin();
        setBiometricEnabled(false);
        dispatch(updateAppState({key: 'biometricEnabled', value: false}));
        showToast({
          type: 'success',
          title: t('BiometricSettings.disabledTitle'),
          message: t('BiometricSettings.disabledMessage'),
        });
      } catch (error) {
        showToast({
          type: 'error',
          title: t('BiometricSettings.errorTitle'),
          message: t('BiometricSettings.errorMessage'),
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Show modal to capture credentials
      setShowModal(true);
    }
  };

  const handleEnableBiometric = async (values: CredentialsFormValues) => {
    if (!currentUserEmail) {
      showToast({
        type: 'error',
        title: t('BiometricSettings.errorTitle'),
        message: t('BiometricSettings.noUserEmail'),
      });
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        login({
          username: currentUserEmail,
          password: values.password,
        }),
      ).unwrap();

      const promptKey = biometricType
        ? 'BiometricSettings.authenticatePromptWithType'
        : 'BiometricSettings.authenticatePrompt';
      const biometricSuccess = await verifyBiometricAuthentication(
        t(promptKey, {type: biometricType}),
      );

      if (biometricSuccess) {
        await enableBiometricLogin({
          username: currentUserEmail,
          password: values.password,
        });

        setBiometricEnabled(true);
        dispatch(updateAppState({key: 'biometricEnabled', value: true}));
        setShowModal(false);
        reset();

        const messageKey = biometricType
          ? 'BiometricSettings.enabledMessageWithType'
          : 'BiometricSettings.enabledMessage';
        showToast({
          type: 'success',
          title: t('BiometricSettings.enabledTitle'),
          message: t(messageKey, {type: biometricType}),
        });
      } else {
        showToast({
          type: 'error',
          title: t('BiometricSettings.authFailedTitle'),
          message: t('BiometricSettings.authFailedMessage'),
        });
      }
    } catch (error: any) {
      const statusCode = error?.statusCode;
      let errorMessage = t('BiometricSettings.errorMessage');

      if (statusCode === 401) {
        errorMessage = t('BiometricSettings.invalidCredentials');
      }

      showToast({
        type: 'error',
        title: t('BiometricSettings.errorTitle'),
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    reset();
  };

  // Hide biometric settings if:
  // 1. Biometric is not available on device
  // 2. User has identity providers (logged in with Google, etc.)
  if (!biometricAvailable || hasIdentityProviders) {
    return null;
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.textContainer}>
            <AppText style={styles.title}>
              {biometricType
                ? t('BiometricSettings.titleWithType', {type: biometricType})
                : t('BiometricSettings.title')}
            </AppText>
            <AppText style={styles.description}>
              {biometricType
                ? t('BiometricSettings.descriptionWithType', {
                    type: biometricType,
                  })
                : t('BiometricSettings.description')}
            </AppText>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={handleToggleBiometric}
            disabled={loading}
            trackColor={{false: colors.lightGrey, true: colors.deepBlue}}
            thumbColor={colors.white}
            ios_backgroundColor={colors.lightGrey}
          />
        </View>
      </View>

      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={handleCloseModal}>
        <Animated.View style={[styles.modalOverlay, {opacity: fadeAnim}]}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}>
            <KeyboardAwareScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}>
              <AppText style={styles.modalTitle}>
                {biometricType
                  ? t('BiometricSettings.modalTitleWithType', {
                      type: biometricType,
                    })
                  : t('BiometricSettings.modalTitle')}
              </AppText>
              <AppText style={styles.modalDescription}>
                {t('BiometricSettings.modalDescription')}
              </AppText>

              <View style={styles.inputContainer}>
                <View style={styles.emailDisplay}>
                  <AppText style={styles.emailLabel}>
                    {t('BiometricSettings.emailLabel')}
                  </AppText>
                  <AppText style={styles.emailText}>{currentUserEmail}</AppText>
                </View>

                <TextInputField
                  control={control}
                  name="password"
                  labelKey="BiometricSettings.passwordLabel"
                  placeholder="BiometricSettings.passwordPlaceholder"
                  isPassword
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCloseModal}
                  disabled={loading}>
                  <AppText style={styles.cancelButtonText}>
                    {t('BiometricSettings.cancel')}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    (!isValid || loading) && styles.disabledButton,
                  ]}
                  onPress={handleSubmit(handleEnableBiometric)}
                  disabled={!isValid || loading}>
                  {loading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <AppText style={styles.confirmButtonText}>
                      {t('BiometricSettings.enable')}
                    </AppText>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAwareScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: scale(12),
    padding: scale(16),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: scale(16),
  },
  title: {
    fontSize: scale(16),
    color: colors.lightblack,
    ...primaryFont('600'),
    marginBottom: scale(4),
  },
  description: {
    fontSize: scale(14),
    color: colors.grey,
    ...primaryFont('400'),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: scale(16),
    width: '100%',
    maxWidth: scale(400),
    maxHeight: '80%',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollContent: {
    padding: scale(24),
  },
  modalTitle: {
    fontSize: scale(20),
    color: colors.deepBlue,
    ...primaryFont('700'),
    marginBottom: scale(8),
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: scale(14),
    color: colors.grey,
    ...primaryFont('400'),
    marginBottom: scale(24),
    textAlign: 'center',
    lineHeight: scale(20),
  },
  inputContainer: {
    gap: scale(16),
    marginBottom: scale(24),
  },
  emailDisplay: {
    backgroundColor: colors.lightGrey,
    borderRadius: scale(12),
    padding: scale(16),
    gap: scale(4),
  },
  emailLabel: {
    fontSize: scale(12),
    color: colors.grey,
    ...primaryFont('500'),
  },
  emailText: {
    fontSize: scale(16),
    color: colors.lightblack,
    ...primaryFont('600'),
  },
  modalButtons: {
    flexDirection: 'row',
    gap: scale(12),
  },
  modalButton: {
    flex: 1,
    height: scale(48),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
  confirmButton: {
    backgroundColor: colors.deepBlue,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelButtonText: {
    fontSize: scale(16),
    color: colors.grey,
    ...primaryFont('600'),
  },
  confirmButtonText: {
    fontSize: scale(16),
    color: colors.white,
    ...primaryFont('600'),
  },
});
