import {
  ActivityIndicator,
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  I18nManager,
  Platform,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import React, {FC, useState, useEffect, useRef} from 'react';
import {colors, primaryFont, SCREENS} from '../../constants';
import {ScreenHeader} from '../../components/ScreenHeader/ScreenHeader';
import {backIcon} from '../../assets';
import {AppText, ListingSuccessModal} from '../../components';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fontScale, scale, useToast} from '../../utils';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {
  createServiceInProgressSelector,
  requestCreateService,
  resetCreateService,
  fetchServiceListing,
  fetchServiceAvailability,
  requestUpdateServiceAvailability,
  updateAvailabilityInProgressSelector,
  serviceDataSelector,
  availabilityDataSelector,
  requestUpdateService,
} from '../../slices/createService.slice';
import {
  categoriesSelector,
  subcategoriesByKeysSelector,
  subsubcategoriesByKeysSelector,
} from '../../slices/marketplaceData.slice';
import {CreateServiceForm} from './components/CreateServiceForm';
import {CreateServiceAvailability} from './components/CreateServiceAvailability';
import {useConfiguration} from '../../context';
import {types as sdkTypes} from '../../utils';
import {CreateServiceScreenProps} from '../../apptypes';
import {
  convertToSharetribeAvailabilityPlan,
  convertToSharetribeException,
  convertFromSharetribeAvailabilityPlan,
  convertFromSharetribeException,
} from '../CreateBusiness/components/SharetribeAvailabilityHelper';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface FormValues {
  [key: string]: any;
}

type CreateServiceRouteParams = {
  CreateService: {
    listingId?: string;
  };
};

type CreateServiceRouteProp = RouteProp<
  CreateServiceRouteParams,
  'CreateService'
>;

export const CreateService: FC = () => {
  const {t} = useTranslation();
  const {top, bottom} = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<CreateServiceScreenProps['navigation']>();
  const route = useRoute<CreateServiceRouteProp>();
  const config = useConfiguration() as any;
  const {showToast} = useToast();
  const categories = useTypedSelector(categoriesSelector);
  const subcategoriesByKeys = useTypedSelector(subcategoriesByKeysSelector);
  const subsubcategoriesByKeys = useTypedSelector(
    subsubcategoriesByKeysSelector,
  );
  const createInProgress = useTypedSelector(createServiceInProgressSelector);
  const availabilityInProgress = useTypedSelector(
    updateAvailabilityInProgressSelector,
  );
  const serviceData = useTypedSelector(serviceDataSelector);
  const availabilityData = useTypedSelector(availabilityDataSelector);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Refs to hold form data from both steps
  const stepOneDataRef = useRef<FormValues | null>(null);
  const stepTwoDataRef = useRef<FormValues | null>(null);

  // Refs to track validation state
  const stepOneValidRef = useRef<boolean>(false);
  const stepTwoValidRef = useRef<boolean>(false);
  const [isStepOneValid, setIsStepOneValid] = useState(false);
  const [isStepTwoValid, setIsStepTwoValid] = useState(false);

  const routeListingId = route.params?.listingId;
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);

  // Use route listing ID for edit mode, or created listing ID for create mode
  const listingId = routeListingId || createdListingId;
  const isEditMode = !!routeListingId;
  const isLoading =
    createInProgress || availabilityInProgress || loading || isInitialLoading;

  useEffect(() => {
    if (listingId) {
      fetchListingData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  // Cleanup effect to reset slice on unmount
  useEffect(() => {
    return () => {
      dispatch(resetCreateService());
    };
  }, [dispatch]);

  const fetchListingData = async () => {
    try {
      setIsInitialLoading(true);

      // Fetch listing data
      const result = await dispatch(
        fetchServiceListing({id: new sdkTypes.UUID(listingId), config}),
      ).unwrap();

      let combinedInitialValues = result.processedData || {};

      // Also fetch availability data if we have a listing ID
      if (listingId) {
        try {
          const fetchedAvailabilityData = await dispatch(
            fetchServiceAvailability({
              listingId: new sdkTypes.UUID(listingId),
            }),
          ).unwrap();

          // Convert to UI format
          let weeklySchedule = null;
          let timezone = 'Asia/Kolkata';
          let exceptions: any[] = [];

          if (fetchedAvailabilityData.availabilityPlan) {
            const converted = convertFromSharetribeAvailabilityPlan(
              fetchedAvailabilityData.availabilityPlan,
            );
            weeklySchedule = converted.weeklySchedule;
            timezone = converted.timezone;
          }

          if (
            fetchedAvailabilityData.exceptions &&
            fetchedAvailabilityData.exceptions.length > 0
          ) {
            exceptions = fetchedAvailabilityData.exceptions.map(
              (exception: any) => convertFromSharetribeException(exception),
            );
          }

          // Merge availability data into initial values
          combinedInitialValues = {
            ...combinedInitialValues,
            weeklySchedule,
            timezone,
            exceptions,
          };

          // Update step two data ref
          stepTwoDataRef.current = {
            weeklySchedule,
            timezone,
            exceptions,
          };
        } catch (availabilityError) {
          // Don't fail the entire operation if availability loading fails
          // Set default availability values
          combinedInitialValues = {
            ...combinedInitialValues,
            weeklySchedule: null,
            timezone: 'Asia/Riyadh',
            exceptions: [],
          };
        }
      }

      // Set the combined initial values
      setInitialValues(combinedInitialValues);
    } catch (error) {
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleStepOneChange = React.useCallback((values: FormValues) => {
    stepOneDataRef.current = values;
    // Note: Redux state will be updated on submit, not on every change
  }, []);

  const handleStepTwoChange = React.useCallback((values: FormValues) => {
    stepTwoDataRef.current = values;
    // Note: Redux state will be updated on submit, not on every change
  }, []);

  const handleStepOneValidation = React.useCallback((isValid: boolean) => {
    stepOneValidRef.current = isValid;
    setIsStepOneValid(isValid);
  }, []);

  const handleStepTwoValidation = React.useCallback((isValid: boolean) => {
    stepTwoValidRef.current = isValid;
    setIsStepTwoValid(isValid);
  }, []);

  // Initialize refs with existing data when it loads
  useEffect(() => {
    if (initialValues && isEditMode) {
      // Initialize stepOne ref
      if (!stepOneDataRef.current) {
        stepOneDataRef.current = {
          categoryId: initialValues.categoryId,
          subcategoryId: initialValues.subcategoryId,
          subsubcategoryId: initialValues.subsubcategoryId,
          title: initialValues.title,
          description: initialValues.description,
          price: initialValues.price,
          duration: initialValues.duration,
          locationType: initialValues.locationType,
          customAttributes: initialValues.customAttributes,
          // images: initialValues.images,
        };
      }
      // && initialValues.weeklySchedule
      // Initialize stepTwo ref - only in edit mode with actual data
      if (!stepTwoDataRef.current) {
        stepTwoDataRef.current = {
          weeklySchedule: initialValues.weeklySchedule,
          timezone: initialValues.timezone,
          exceptions: initialValues.exceptions || [],
        };
      }
    }
  }, [initialValues, isEditMode]);

  // Watch for Redux state changes and update initialValues - REMOVED to prevent infinite loops
  // The fetchServiceListing thunk now handles populating both initialValues and Redux state

  const handleStepTwoSubmit = async () => {
    try {
      setLoading(true);

      if (!stepTwoDataRef.current) {
        showToast({
          type: 'error',
          title: t('CreateService.error'),
          message: t('CreateService.fillAvailabilityFields'),
        });
        setLoading(false);
        return;
      }

      if (!listingId) {
        showToast({
          type: 'error',
          title: t('CreateService.error'),
          message: t('CreateService.missingListingId'),
        });
        setLoading(false);
        return;
      }

      const stepTwoFormData = stepTwoDataRef.current;

      // Convert availability data
      const availabilityPlan = convertToSharetribeAvailabilityPlan(
        stepTwoFormData.weeklySchedule,
        stepTwoFormData.timezone,
      );

      // Filter and convert exceptions
      const validExceptions = (stepTwoFormData.exceptions || []).filter(
        (ex: any) => {
          if (!ex.startDate || !ex.endDate) {
            return false;
          }
          const startDate = new Date(ex.startDate);
          const endDate = new Date(ex.endDate);
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return false;
          }
          if (startDate > endDate) {
            return false;
          }
          return true;
        },
      );

      const convertedExceptions = validExceptions.map((ex: any) => {
        return convertToSharetribeException(ex, listingId);
      });

      // Update service availability
      await dispatch(
        requestUpdateServiceAvailability({
          listingId: new sdkTypes.UUID(listingId),
          availabilityPlan,
          exceptions: convertedExceptions,
        }),
      ).unwrap();

      showToast({
        type: 'success',
        title: t('CreateService.success'),
        message: isEditMode
          ? t('CreateService.availabilityUpdated')
          : t('CreateService.serviceCreated'),
      });

      if (isEditMode) {
        navigation.goBack();
      } else {
        setShowModal(true);
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        title: t('CreateService.error'),
        message: error.message || t('CreateService.errorMessage'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStepOneSubmit = async () => {
    try {
      setLoading(true);

      if (!stepOneDataRef.current) {
        showToast({
          type: 'error',
          title: t('CreateService.error'),
          message: t('CreateService.fillAllFields'),
        });
        setLoading(false);
        return;
      }

      const stepOneFormData = stepOneDataRef.current;

      // Get the selected category and subcategory config
      const selectedCategory = categories.find(
        cat => cat.id === stepOneFormData.categoryId,
      );
      const selectedSubcategory =
        subcategoriesByKeys[stepOneFormData.subcategoryId];
      const selectedSubSubcategory =
        subsubcategoriesByKeys[stepOneFormData.subsubcategoryId];

      const serviceRequestData = {
        categoryId: stepOneFormData.categoryId,
        subcategoryId: stepOneFormData.subcategoryId,
        subsubcategoryId: stepOneFormData.subsubcategoryId,
        title: stepOneFormData.title,
        description: stepOneFormData.description,
        price: parseFloat(stepOneFormData.price),
        duration: parseInt(stepOneFormData.duration, 10),
        locationType: stepOneFormData.locationType,
        customAttributes: stepOneFormData.customAttributes || {},
        categoryConfig: selectedCategory,
        subcategoryConfig: selectedSubcategory,
        subsubcategoryConfig: selectedSubSubcategory,
      };

      if (isEditMode) {
        // Update existing service details
        await dispatch(
          requestUpdateService({
            ...serviceRequestData,
            listingId: new sdkTypes.UUID(listingId),
          }),
        ).unwrap();
        showToast({
          type: 'success',
          title: t('CreateService.updateSuccess'),
          message: t('CreateService.detailsUpdated'),
        });
      } else {
        // Create new service
        const result = await dispatch(
          requestCreateService(serviceRequestData),
        ).unwrap();

        const newListingId = result.data.id.uuid;
        setCreatedListingId(newListingId);

        showToast({
          type: 'success',
          title: t('CreateService.success'),
          message: t('CreateService.detailsCreated'),
        });
      }

      // Move to step 2 automatically
      setCurrentStep(1);
      flatListRef.current?.scrollToIndex({
        index: 1,
        animated: true,
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: t('CreateService.error'),
        message: error.message || t('CreateService.errorMessage'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      // Step 1: Submit service details and move to step 2
      handleStepOneSubmit();
    } else if (currentStep === 1) {
      // Step 2: Submit availability
      handleStepTwoSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      flatListRef.current?.scrollToIndex({
        index: currentStep - 1,
        animated: true,
      });
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    dispatch(resetCreateService());
    navigation.goBack();
  };

  const handleAddServicePress = React.useCallback(() => {
    navigation.replace(SCREENS.ADD_SERVICE);
  }, [navigation]);

  const steps = React.useMemo(
    () => [
      {
        id: '1',
        title: t('CreateService.serviceInfoTitle'),
        component: (
          <CreateServiceForm
            key="step-one"
            categories={categories}
            subcategoriesByKeys={subcategoriesByKeys}
            subsubcategoriesByKeys={subsubcategoriesByKeys}
            inProgress={isLoading}
            onSubmit={handleStepOneChange}
            onChange={handleStepOneChange}
            onValidationChange={handleStepOneValidation}
            initialValues={
              initialValues || serviceData
                ? {
                    categoryId:
                      (initialValues || serviceData)?.categoryId || '',
                    subcategoryId:
                      (initialValues || serviceData)?.subcategoryId || '',
                    subsubcategoryId:
                      (initialValues || serviceData)?.subsubcategoryId || '',
                    title: (initialValues || serviceData)?.title || '',
                    description:
                      (initialValues || serviceData)?.description || '',
                    price: (initialValues || serviceData)?.price || '',
                    duration: (initialValues || serviceData)?.duration || '',
                    locationType:
                      (initialValues || serviceData)?.locationType || '',
                    customAttributes:
                      (initialValues || serviceData)?.customAttributes || {},
                    // images: initialValues.images,
                  }
                : undefined
            }
            isEditMode={isEditMode}
            onAddServicePress={handleAddServicePress}
          />
        ),
      },
      {
        id: '2',
        title: t('CreateService.availabilityTitle'),
        component: (
          <CreateServiceAvailability
            key="step-two"
            inProgress={isLoading}
            onSubmit={handleStepTwoChange}
            onChange={handleStepTwoChange}
            onValidationChange={handleStepTwoValidation}
            initialValues={
              initialValues || availabilityData
                ? {
                    weeklySchedule:
                      (initialValues || availabilityData)?.weeklySchedule ||
                      null,
                    timezone:
                      (initialValues || availabilityData)?.timezone ||
                      'Asia/Riyadh',
                    exceptions:
                      (initialValues || availabilityData)?.exceptions || [],
                  }
                : undefined
            }
          />
        ),
      },
    ],
    [
      initialValues,
      serviceData,
      availabilityData,
      categories,
      subcategoriesByKeys,
      subsubcategoriesByKeys,
      handleStepOneChange,
      handleStepTwoChange,
      handleStepOneValidation,
      handleStepTwoValidation,
      isLoading,
      isEditMode,
      handleAddServicePress,
      t,
    ],
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <View
            style={[
              styles.stepIndicator,
              index <= currentStep && styles.stepIndicatorActive,
            ]}
          />
          {index < steps.length - 1 && (
            <View
              style={[
                styles.stepConnector,
                index < currentStep && styles.stepConnectorActive,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStep = ({
    item,
    index,
  }: {
    item: (typeof steps)[0];
    index: number;
  }) => (
    <View style={styles.stepContainer}>
      <ScrollView
        style={styles.stepScrollView}
        contentContainerStyle={styles.stepContent}
        showsVerticalScrollIndicator={false}>
        <AppText style={styles.stepTitle}>{item.title}</AppText>
        {item.component}
      </ScrollView>

      {/* Sticky button inside each step */}
      <View style={styles.stickyButtonContainer}>
        {Platform.OS === 'ios' && (
          <BlurView
            style={styles.blurBackground}
            blurType={'light'}
            blurAmount={10}
            reducedTransparencyFallbackColor={colors.white}
            enabled={false}
          />
        )}
        <View
          style={[styles.buttonWrapper, {paddingBottom: bottom || scale(20)}]}>
          {index > 0 && (
            <TouchableOpacity
              onPress={handleBack}
              disabled={isLoading}
              style={[styles.button, styles.backButton]}
              activeOpacity={0.7}>
              <AppText style={styles.backButtonText}>
                {t('CreateService.back')}
              </AppText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleNext}
            disabled={
              isLoading || (index === 0 ? !isStepOneValid : !isStepTwoValid)
            }
            style={[
              styles.button,
              styles.primaryButton,
              index === 0 && styles.fullWidthButton,
              (isLoading ||
                (index === 0 ? !isStepOneValid : !isStepTwoValid)) &&
                styles.buttonDisabled,
            ]}
            activeOpacity={0.7}>
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <AppText style={styles.primaryButtonText}>
                {index === steps.length - 1
                  ? isEditMode
                    ? t('CreateService.updateService')
                    : t('CreateService.publish')
                  : t('CreateService.next')}
              </AppText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, {paddingTop: top}]}>
      <ScreenHeader
        containerStyle={{marginBottom: scale(16)}}
        leftIcon={backIcon}
        renderCenter={() => (
          <AppText style={styles.heading}>
            {isEditMode
              ? t('CreateService.editHeading')
              : t('CreateService.heading')}
          </AppText>
        )}
      />

      {categories.length === 0 || (isEditMode && !initialValues) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.deepBlue} />
        </View>
      ) : (
        <>
          {renderStepIndicator()}

          <FlatList
            ref={flatListRef}
            data={steps}
            renderItem={renderStep}
            keyExtractor={item => item.id}
            horizontal
            pagingEnabled
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            style={styles.flatListContainer}
            getItemLayout={(_data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
          />
        </>
      )}

      <ListingSuccessModal visible={showModal} onClose={handleModalClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  formWrapper: {
    flex: 1,
  },
  heading: {
    fontSize: fontScale(18),
    color: colors.textBlack,
    ...primaryFont('500'),
  },
  stepIndicatorContainer: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
  },
  stepIndicator: {
    flex: 1,
    height: scale(4),
    backgroundColor: colors.lightGray,
    borderRadius: scale(2),
  },
  stepIndicatorActive: {
    backgroundColor: colors.blue,
  },
  stepConnector: {
    width: scale(8),
  },
  stepConnectorActive: {},
  stepContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  stepScrollView: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: scale(20),
    paddingBottom: scale(100),
  },
  stepTitle: {
    fontSize: fontScale(20),
    color: colors.deepBlue,
    ...primaryFont('600'),
    marginBottom: scale(20),
    ...(I18nManager.isRTL && {textAlign: 'left'}),
  },
  flatListContainer: {
    flex: 1,
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    paddingVertical: scale(15),
    gap: scale(12),
  },
  button: {
    flex: 1,
    height: scale(48),
    borderRadius: scale(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: colors.lightGray,
  },
  backButtonText: {
    color: colors.textBlack,
    fontSize: fontScale(16),
    ...primaryFont('600'),
  },
  primaryButton: {
    backgroundColor: colors.blue,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontScale(16),
    ...primaryFont('600'),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  fullWidthButton: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
