import React, {useCallback, useState, useRef, useEffect} from 'react';
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
import PhoneInput, {parsePhoneNumber} from 'react-native-phone-number-input';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {BlurView} from '@react-native-community/blur';
import {
  AppText,
  Button,
  GradientWrapper,
  ScreenHeader,
  TextInputField,
  PhoneInputField,
} from '../../components';
import {colors, primaryFont, SCREENS} from '../../constants';
import {scale} from '../../utils';
import {placeholder, backIcon, editIcon, avatarPlaceholder} from '../../assets';
import {
  useAppDispatch,
  useTypedSelector,
  RootState,
} from '../../sharetribeSetup';
import {
  updateCurrentUser,
  hasIdentityProvidersSelector,
  uploadProfileImage,
  fetchCurrentUser,
} from '../../slices/user.slice';
import {useToast} from '../../utils/toast';
import {launchImageLibrary} from 'react-native-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const editProfileSchema = z.object({
  firstName: z.string().min(1, 'EditProfile.firstNameRequired'),
  lastName: z.string().min(1, 'EditProfile.lastNameRequired'),
  displayName: z.string().min(1, 'EditProfile.displayNameRequired'),
  phoneNumber: z.string().min(1, 'EditProfile.phoneNumberRequired'),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export const EditProfile: React.FC = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const {showToast} = useToast();
  const {bottom} = useSafeAreaInsets();
  const phoneInputRef = useRef<PhoneInput | null>(null);
  const isRTL = I18nManager.isRTL;

  const currentUser = useTypedSelector(
    (state: RootState) => state.user.currentUser,
  );
  const hasIdp = useTypedSelector(hasIdentityProvidersSelector);
  const updateInProgress = useTypedSelector(
    (state: RootState) => state.user.updateCurrentUserInProgress,
  );

  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [profileImageId, setProfileImageId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Get stored phone number with country code
  const storedPhoneNumber = (
    currentUser?.attributes?.profile?.protectedData as any
  )?.phoneNumber;
  const {countryCode} = parsePhoneNumber(storedPhoneNumber) ?? {};

  const {control, handleSubmit, setError, clearErrors, setValue} =
    useForm<EditProfileFormData>({
      resolver: zodResolver(editProfileSchema),
      defaultValues: {
        firstName: currentUser?.attributes?.profile?.firstName || '',
        lastName: currentUser?.attributes?.profile?.lastName || '',
        displayName: currentUser?.attributes?.profile?.displayName || '',
        phoneNumber: '',
      },
    });

  useEffect(() => {
    const parsedPhoneNumber = storedPhoneNumber
      ? parsePhoneNumber(storedPhoneNumber)
      : null;

    const {callingCode, phoneNumber} = parsedPhoneNumber ?? {};
    if (callingCode && phoneNumber) {
      const isValid = phoneInputRef.current?.isValidNumber(storedPhoneNumber);

      if (isValid) {
        phoneInputRef.current?.setState({
          number: phoneNumber,
        });
        // Set the form value so validation passes
        setValue('phoneNumber', storedPhoneNumber);
      }
    }
  }, [storedPhoneNumber, setValue]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleChangePassword = useCallback(() => {
    (navigation as any).navigate(SCREENS.CHANGE_PASSWORD);
  }, [navigation]);

  const handleChangeEmail = useCallback(() => {
    (navigation as any).navigate(SCREENS.CHANGE_EMAIL);
  }, [navigation]);

  const handleProfileImageEdit = useCallback(async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      async response => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          showToast({
            type: 'error',
            title: t('EditProfile.imageUploadError'),
            message: response.errorMessage,
          });
          return;
        }
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          setProfileImageUri(asset.uri || null);

          // Upload image to Sharetribe
          setIsUploadingImage(true);
          try {
            const file = {
              uri: asset.uri,
              name: asset.fileName || 'profile.jpg',
              type: asset.type || 'image/jpeg',
            };

            const result = await dispatch(uploadProfileImage({file})).unwrap();
            setProfileImageId(result.id);
          } catch (error: any) {
            showToast({
              type: 'error',
              title: t('EditProfile.imageUploadError'),
              message: error?.message || t('EditProfile.updateErrorMessage'),
            });
            setProfileImageUri(null);
          } finally {
            setIsUploadingImage(false);
          }
        }
      },
    );
  }, [dispatch, showToast, t]);

  const onSubmit = useCallback(
    async (data: EditProfileFormData) => {
      console.log('data', data);
      try {
        const phoneNumberChanged = data.phoneNumber !== storedPhoneNumber;
        const updateParams: any = {
          firstName: data.firstName,
          lastName: data.lastName,
          displayName: data.displayName,
          protectedData: {
            phoneNumber: data.phoneNumber,
          },
        };

        // If phone number changed, mark as unverified in public data
        if (phoneNumberChanged) {
          updateParams.publicData = {
            phoneNumberVerified: false,
          };
        }

        // If profile image was uploaded, include it in the update
        if (profileImageId) {
          updateParams.profileImageId = profileImageId;
        }

        await dispatch(updateCurrentUser(updateParams)).unwrap();

        // Fetch updated user data to get the new profile image
        await dispatch(fetchCurrentUser({}));

        showToast({
          type: 'success',
          title: t('EditProfile.updateSuccess'),
          message: t('EditProfile.updateSuccessMessage'),
        });
        navigation.goBack();
      } catch (error: any) {
        showToast({
          type: 'error',
          title: t('EditProfile.updateError'),
          message: error?.message || t('EditProfile.updateErrorMessage'),
        });
      }
    },
    [dispatch, navigation, showToast, t, storedPhoneNumber, profileImageId],
  );

  const profileImage =
    profileImageUri ||
    (currentUser as any)?.profileImage?.attributes?.variants?.['square-small']
      ?.url;

  return (
    <View style={styles.container}>
      <GradientWrapper
        colors={[colors.deepBlue, colors.blue, colors.white]}
        end={{x: 0.5, y: 0.5}}>
        <ScreenHeader
          renderCenter={() => (
            <AppText style={styles.headerTitle}>
              {t('EditProfile.heading')}
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

        <KeyboardAwareScrollView
          contentContainerStyle={styles.contentSection}
          showsVerticalScrollIndicator={false}
          enabled
          bottomOffset={Math.max(bottom, scale(20))}
          keyboardShouldPersistTaps="handled">
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            <TouchableOpacity
              onPress={handleProfileImageEdit}
              style={styles.profileImageWrapper}>
              <Image
                source={profileImage ? {uri: profileImage} : avatarPlaceholder}
                style={styles.profileImage}
              />
              <View style={styles.editIconOverlay}>
                <Image source={editIcon} style={styles.editIcon} />
              </View>
            </TouchableOpacity>
            <AppText style={styles.profileName}>
              {currentUser?.attributes?.profile?.displayName}
            </AppText>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <TextInputField
              control={control}
              labelStyle={styles.inputLabel}
              name="firstName"
              labelKey="EditProfile.firstNameLabel"
              placeholder="EditProfile.firstNamePlaceholder"
            />

            <TextInputField
              control={control}
              labelStyle={styles.inputLabel}
              name="lastName"
              labelKey="EditProfile.lastNameLabel"
              placeholder="EditProfile.lastNamePlaceholder"
            />

            <TextInputField
              control={control}
              labelStyle={styles.inputLabel}
              name="displayName"
              labelKey="EditProfile.displayNameLabel"
              placeholder="EditProfile.displayNamePlaceholder"
            />

            {/* Email Field - Navigate to Change Email */}
            {!hasIdp && (
              <View style={styles.emailContainer}>
                <AppText style={[styles.emailLabel, styles.inputLabel]}>
                  {t('EditProfile.emailLabel')}
                </AppText>
                <TouchableOpacity
                  style={styles.emailField}
                  onPress={handleChangeEmail}>
                  <AppText style={styles.emailValue}>
                    {currentUser?.attributes?.email}
                  </AppText>
                  <Image
                    source={editIcon}
                    style={[
                      styles.editIconSmall,
                      isRTL && {transform: [{scaleX: -1}]},
                    ]}
                  />
                </TouchableOpacity>
              </View>
            )}

            {hasIdp && (
              <View style={styles.emailContainer}>
                <AppText style={styles.emailLabel}>
                  {t('EditProfile.emailLabel')}
                </AppText>
                <View style={[styles.emailField, styles.disabledField]}>
                  <AppText style={styles.emailValue}>
                    {currentUser?.attributes?.email}
                  </AppText>
                </View>
              </View>
            )}

            <PhoneInputField
              control={control}
              name="phoneNumber"
              labelKey="EditProfile.phoneLabel"
              placeholderKey="EditProfile.phonePlaceholder"
              setError={setError}
              clearErrors={clearErrors}
              phoneInputRef={phoneInputRef}
              defaultCode={countryCode}
              labelStyle={styles.inputLabel}
            />

            {/* Password Field - Navigate to Change Password */}
            <View style={styles.passwordContainer}>
              <AppText style={[styles.passwordLabel, styles.inputLabel]}>
                {t('EditProfile.passwordLabel')}
              </AppText>
              <TouchableOpacity
                style={styles.passwordField}
                onPress={handleChangePassword}>
                <AppText style={styles.passwordValue}>••••••••••••</AppText>
                <Image
                  source={editIcon}
                  style={[
                    styles.editIconSmall,
                    isRTL && {transform: [{scaleX: -1}]},
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
        <View style={[styles.submitButtonContainer]}>
          <BlurView
            style={styles.blurBackground}
            blurType={'light'}
            blurAmount={10}
            reducedTransparencyFallbackColor={colors.white}
          />
          <View style={[styles.buttonWrapper, {paddingBottom: bottom}]}>
            <Button
              title="EditProfile.saveChanges"
              onPress={handleSubmit(onSubmit)}
              loader={updateInProgress || isUploadingImage}
              disabled={updateInProgress || isUploadingImage}
            />
          </View>
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
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: scale(30),
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    borderWidth: scale(3),
    borderColor: colors.blue,
  },
  editIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: scale(15),
    width: scale(30),
    height: scale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    width: scale(16),
    height: scale(16),
    tintColor: colors.deepBlue,
  },
  profileName: {
    fontSize: scale(20),
    color: colors.white,
    marginTop: scale(12),
    ...primaryFont('600'),
  },
  formContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: scale(50),
  },
  disabledInput: {
    backgroundColor: colors.lightGrey,
    opacity: 0.6,
  },
  emailContainer: {
    marginTop: scale(16),
  },
  emailLabel: {
    fontSize: scale(16),
    color: colors.neutralDark,
    marginBottom: scale(10),
    ...primaryFont('400'),
    textAlign: 'left',
  },
  emailField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    height: scale(48),
    borderWidth: scale(1),
    borderColor: colors.lightGrey,
    backgroundColor: colors.white,
    borderRadius: scale(100),
  },
  emailValue: {
    fontSize: scale(16),
    color: colors.black,
    ...primaryFont('400'),
  },
  disabledField: {
    backgroundColor: colors.lightGrey,
    opacity: 0.6,
  },
  passwordContainer: {
    marginTop: scale(16),
  },
  passwordLabel: {
    fontSize: scale(16),
    color: colors.neutralDark,
    marginBottom: scale(10),
    ...primaryFont('400'),
  },
  passwordField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    height: scale(48),
    borderWidth: scale(1),
    borderColor: colors.lightGrey,
    backgroundColor: colors.white,
    borderRadius: scale(100),
  },
  passwordValue: {
    fontSize: scale(16),
    color: colors.black,
    ...primaryFont('400'),
  },
  editIconSmall: {
    width: scale(20),
    height: scale(20),
    tintColor: colors.deepBlue,
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(20),
    overflow: 'hidden',
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonWrapper: {
    paddingTop: scale(8),
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
    ...(I18nManager.isRTL && {textAlign: 'left'}),
  },
});
