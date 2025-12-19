import {
  FlatList,
  StyleSheet,
  View,
  Dimensions,
  ScrollView,
  I18nManager,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import React, {FC, useState, useRef} from 'react';
import {colors, primaryFont} from '../../constants';
import {ScreenHeader} from '../../components/ScreenHeader/ScreenHeader';
import {backIcon} from '../../assets';
import {AppText, ListingSuccessModal} from '../../components';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fontScale, scale, useToast} from '../../utils';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {useNavigation} from '@react-navigation/native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
import {
  createBusinessInProgressSelector,
  requestCreateBusinessDraft,
  requestPublishBusiness,
  resetCreateBusiness,
  fetchBusinessListing,
} from '../../slices/createBusiness.slice';
import {getOwnListingsById} from '../../slices/marketplaceData.slice';
import {CreateBusinessStepOne} from './components/CreateBusinessStepOne';
import {CreateBusinessStepTwo} from './components/CreateBusinessStepTwo';
import {types as sdkTypes} from '../../utils';
import {
  convertToSharetribeAvailabilityPlan,
  convertToSharetribeException,
  convertFromSharetribeAvailabilityPlan,
  convertFromSharetribeException,
} from './components/SharetribeAvailabilityHelper';

interface FormValues {
  [key: string]: any;
}

export const CreateBusiness: FC = () => {
  const {t} = useTranslation();
  const {top} = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const {showToast} = useToast();
  const createInProgress = useTypedSelector(createBusinessInProgressSelector);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const {bottom} = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  // Refs to hold form data from both components
  const stepOneDataRef = useRef<FormValues | null>(null);
  const stepTwoDataRef = useRef<FormValues | null>(null);

  const isLoading = createInProgress || loading;

  // Check if user already has a business listing
  const currentUser = useTypedSelector((state: any) => state.user.currentUser);
  const existingBusinessId = useTypedSelector(
    (state: any) =>
      state.user.currentUser?.attributes?.profile?.publicData
        ?.businessListingId,
  );

  React.useEffect(() => {
    console.log('👤 Current user:', currentUser);
    console.log('🏢 Business listing ID from profile:', existingBusinessId);
  }, [currentUser, existingBusinessId]);

  const [isEditMode, setIsEditMode] = useState(false);

  // Get business data from createBusiness slice (includes listing and exceptions)
  const businessDataFromSlice = useTypedSelector(
    (state: any) => state.createBusiness.businessData,
  );

  const existingBusinessData = React.useMemo(() => {
    if (!existingBusinessId || !businessDataFromSlice) {
      return null;
    }

    console.log('📦 Business data from slice:', businessDataFromSlice);

    const listing = businessDataFromSlice.listing?.data;
    if (!listing) {
      console.warn('⚠️ No listing data in businessData');
      return null;
    }

    console.log('📦 Listing data:', listing);

    const businessData: any = {
      title: listing.attributes.title,
      description: listing.attributes.description,
      location: listing.attributes.geolocation
        ? {
            lat: listing.attributes.geolocation.lat,
            lng: listing.attributes.geolocation.lng,
            address: listing.attributes.publicData?.address || '',
          }
        : null,
      registrationNumber:
        listing.attributes.publicData?.registrationNumber || '',
      images:
        listing.relationships?.images?.data?.map((img: any) => ({
          id: img.id.uuid,
          url:
            businessDataFromSlice.listing?.included?.find(
              (inc: any) => inc.id.uuid === img.id.uuid,
            )?.attributes?.variants?.default?.url || '',
        })) || [],
      availabilityPlan: listing.attributes.availabilityPlan,
    };

    // Convert availability plan to UI format
    if (businessData.availabilityPlan) {
      const {weeklySchedule, timezone} = convertFromSharetribeAvailabilityPlan(
        businessData.availabilityPlan,
      );
      businessData.weeklySchedule = weeklySchedule;
      businessData.timezone = timezone;
    }

    // Get exceptions from createBusiness slice
    const exceptionsFromSlice = businessDataFromSlice.exceptions || [];
    console.log('🔄 Memo: exceptions from slice:', exceptionsFromSlice);
    console.log('🔄 Memo: exceptions count:', exceptionsFromSlice.length);

    if (exceptionsFromSlice.length > 0) {
      console.log(
        '🔄 Converting exceptions to UI format:',
        exceptionsFromSlice,
      );
      businessData.exceptions = exceptionsFromSlice.map(
        convertFromSharetribeException,
      );
      console.log('✅ Converted exceptions:', businessData.exceptions);
    } else {
      console.log('⚠️ Memo: No exceptions to convert');
      businessData.exceptions = [];
    }

    console.log(
      '📦 Memo: Returning businessData with exceptions:',
      businessData.exceptions,
    );
    return businessData;
  }, [existingBusinessId, businessDataFromSlice]);

  // Load existing business data
  React.useEffect(() => {
    const loadExistingBusiness = async () => {
      console.log('🔍 Checking for existing business ID:', existingBusinessId);

      if (existingBusinessId) {
        console.log('📋 Loading existing business:', existingBusinessId);
        setIsEditMode(true);

        try {
          console.log('🚀 Dispatching fetchBusinessListing...');
          const result = await dispatch(
            fetchBusinessListing({id: new sdkTypes.UUID(existingBusinessId)}),
          ).unwrap();

          console.log('📦 Received result:', JSON.stringify(result, null, 2));
          console.log('📦 Result type:', typeof result);
          console.log('📦 Result keys:', Object.keys(result || {}));
          console.log('📦 Result has exceptions?', !!result?.exceptions);
          console.log('📦 Exceptions count:', result?.exceptions?.length || 0);
          console.log('📦 Exceptions value:', result?.exceptions);

          // Exceptions are now stored in createBusiness.businessData by the slice
          console.log(
            '✅ Business data loaded (exceptions in createBusiness slice)',
          );
        } catch (error) {
          console.error('❌ Failed to load business:', error);
        }
      }
    };

    loadExistingBusiness();
  }, [existingBusinessId, dispatch]);

  const handleStepOneChange = React.useCallback((values: FormValues) => {
    console.log('📝 StepOne changed:', values);
    stepOneDataRef.current = values;
  }, []);

  const handleStepTwoChange = React.useCallback((values: FormValues) => {
    console.log('📝 StepTwo changed:', values);
    stepTwoDataRef.current = values;
  }, []);

  // Initialize refs with existing data when it loads
  React.useEffect(() => {
    if (existingBusinessData && isEditMode) {
      console.log('🔄 Initializing refs with existing data');

      // Initialize stepOne ref
      if (!stepOneDataRef.current) {
        stepOneDataRef.current = {
          title: existingBusinessData.title,
          description: existingBusinessData.description,
          location: existingBusinessData.location,
          registrationNumber: existingBusinessData.registrationNumber,
          images: existingBusinessData.images,
        };
        console.log('✅ StepOne ref initialized');
      }

      // Initialize stepTwo ref
      if (!stepTwoDataRef.current) {
        stepTwoDataRef.current = {
          weeklySchedule: existingBusinessData.weeklySchedule,
          timezone: existingBusinessData.timezone,
          exceptions: existingBusinessData.exceptions || [],
        };
        console.log('✅ StepTwo ref initialized');
      }
    }
  }, [existingBusinessData, isEditMode]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      console.log('📝 Submit - StepOne data:', stepOneDataRef.current);
      console.log('📝 Submit - StepTwo data:', stepTwoDataRef.current);

      // Validate both forms have data
      if (!stepOneDataRef.current || !stepTwoDataRef.current) {
        console.error('❌ Missing form data:', {
          stepOne: !!stepOneDataRef.current,
          stepTwo: !!stepTwoDataRef.current,
        });
        showToast({
          type: 'error',
          title: t('CreateBusiness.error'),
          message: t('CreateBusiness.fillAllFields'),
        });
        setLoading(false);
        return;
      }

      const stepOneData = stepOneDataRef.current;
      const stepTwoData = stepTwoDataRef.current;

      // Step 1: Create draft with basic info
      const imageIds =
        stepOneData.images
          ?.map((img: any) => {
            if (typeof img.id === 'string') {
              return img.id;
            }
            if (img.id?.uuid) {
              return img.id.uuid;
            }
            return null;
          })
          .filter(Boolean) || [];

      const businessData = {
        title: stepOneData.title,
        description: stepOneData.description,
        location: stepOneData.location || {
          lat: 24.7136,
          lng: 46.6753,
          address: 'Riyadh, Saudi Arabia',
        },
        registrationNumber: stepOneData.registrationNumber,
        images: imageIds,
      };

      const result = await dispatch(
        requestCreateBusinessDraft(businessData),
      ).unwrap();

      const listingId = result.data.id.uuid;
      console.log('📝 Draft listing ID:', listingId);

      // Step 2: Convert to Sharetribe format and publish
      const availabilityPlan = convertToSharetribeAvailabilityPlan(
        stepTwoData.weeklySchedule,
        stepTwoData.timezone,
      );

      console.log('📅 Raw exceptions from form:', stepTwoData.exceptions);
      console.log('📅 Exceptions count:', stepTwoData.exceptions?.length || 0);

      const exceptions = (stepTwoData.exceptions || [])
        .filter((ex: any) => {
          // Validate exception has required fields
          if (!ex.startDate || !ex.endDate) {
            console.warn('⚠️ Skipping invalid exception (missing dates):', ex);
            return false;
          }

          // Validate dates are valid
          const startDate = new Date(ex.startDate);
          const endDate = new Date(ex.endDate);

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.warn('⚠️ Skipping invalid exception (invalid dates):', ex);
            return false;
          }

          // Validate start is before or equal to end
          if (startDate > endDate) {
            console.warn('⚠️ Skipping invalid exception (start > end):', ex);
            return false;
          }

          return true;
        })
        .map((ex: any) => {
          console.log('🔄 Converting exception:', ex);
          const converted = convertToSharetribeException(ex, listingId);
          console.log('✅ Converted to:', converted);
          return converted;
        });

      console.log('📅 Final exceptions for API:', exceptions);
      console.log('📅 Valid exceptions count:', exceptions.length);

      const publishData = {
        listingId: new sdkTypes.UUID(listingId),
        availabilityPlan,
        exceptions,
      };

      console.log(
        '📤 Publishing with data:',
        JSON.stringify(publishData, null, 2),
      );

      await dispatch(requestPublishBusiness(publishData)).unwrap();

      if (isEditMode) {
        // Show toast for updates
        showToast({
          type: 'success',
          title: t('CreateBusiness.success'),
          message: t('CreateBusiness.businessUpdatedSuccessfully'),
        });
        dispatch(resetCreateBusiness());
        navigation.goBack();
      } else {
        // Show modal for new listings
        setShowModal(true);
      }
    } catch (error: any) {
      console.error('Error creating business:', error);
      showToast({
        type: 'error',
        title: t('CreateBusiness.error'),
        message: error.message || t('CreateBusiness.errorMessage'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    dispatch(resetCreateBusiness());
    navigation.goBack();
  };

  const handleNext = () => {
    if (currentStep < 1) {
      setCurrentStep(currentStep + 1);
      flatListRef.current?.scrollToIndex({
        index: currentStep + 1,
        animated: true,
      });
    } else {
      handleSubmit();
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

  const steps = React.useMemo(
    () => [
      {
        id: '1',
        title: t('CreateBusiness.basicInfoTitle'),
        component: (
          <CreateBusinessStepOne
            key="step-one"
            inProgress={isLoading}
            onSubmit={handleStepOneChange}
            onChange={handleStepOneChange}
            initialValues={
              existingBusinessData
                ? {
                    title: existingBusinessData.title,
                    description: existingBusinessData.description,
                    location: existingBusinessData.location,
                    registrationNumber: existingBusinessData.registrationNumber,
                    images: existingBusinessData.images,
                  }
                : undefined
            }
          />
        ),
      },
      {
        id: '2',
        title: t('CreateBusiness.availabilityTitle'),
        component: (
          <CreateBusinessStepTwo
            key="step-two"
            inProgress={isLoading}
            onSubmit={handleStepTwoChange}
            onChange={handleStepTwoChange}
            initialValues={
              existingBusinessData
                ? {
                    weeklySchedule: existingBusinessData.weeklySchedule,
                    timezone: existingBusinessData.timezone,
                    exceptions: existingBusinessData.exceptions || [],
                  }
                : undefined
            }
          />
        ),
      },
    ],
    [
      existingBusinessData,
      handleStepOneChange,
      handleStepTwoChange,
      isLoading,
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
        <BlurView
          style={styles.blurBackground}
          blurType={'light'}
          blurAmount={10}
          reducedTransparencyFallbackColor={colors.white}
        />
        <View
          style={[styles.buttonWrapper, {paddingBottom: bottom || scale(20)}]}>
          {index > 0 && (
            <TouchableOpacity
              onPress={handleBack}
              disabled={isLoading}
              style={[styles.button, styles.backButton]}
              activeOpacity={0.7}>
              <AppText style={styles.backButtonText}>
                {t('CreateBusiness.back')}
              </AppText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleNext}
            disabled={isLoading}
            style={[
              styles.button,
              styles.primaryButton,
              index === 0 && styles.fullWidthButton,
              isLoading && styles.buttonDisabled,
            ]}
            activeOpacity={0.7}>
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <AppText style={styles.primaryButtonText}>
                {index === steps.length - 1
                  ? isEditMode
                    ? t('CreateBusiness.updateBusiness')
                    : t('CreateBusiness.publish')
                  : t('CreateBusiness.next')}
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
            {t('CreateBusiness.heading')}
          </AppText>
        )}
      />

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

      <ListingSuccessModal visible={showModal} onClose={handleModalClose} />
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
});
