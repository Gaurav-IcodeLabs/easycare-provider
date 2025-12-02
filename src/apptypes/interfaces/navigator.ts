import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AUTH, SCREENS} from '../../constants';

export type AppStackParamList = {
  SignUp: undefined;
  Login: undefined;
  RecoverPassword: undefined;
  ResetPassword: undefined;
  SelectLanguage: undefined;
  InterestSelection: undefined;
  RequestLocation: undefined;
  RequestManuallLocation: undefined;
  Listing: {id: string};
  TodaysHotDeals: undefined;
  CategoryScreen: undefined;
  MerchantProfile: {
    listingId: {
      uuid: string;
      _sdkType: string;
    };
  };
  ChatMessage: {
    transactionId: string;
  };
};

export type AuthStackParamList = {
  [AUTH.ONBOARDING]: undefined;
  [AUTH.LOGIN]: undefined;
  [AUTH.SIGNUP]: undefined;
  [AUTH.FORGOT_PASSWORD]: undefined;
  [AUTH.NEW_PASSWORD]: {email: string; token: string};
  [AUTH.VERIFT_OTP]: {token: string};
  [AUTH.OTP_VERIFIED]: undefined;
};
export type MainStackParamList = {
  [SCREENS.MAIN_TABS]: undefined;
  [SCREENS.HOME]: undefined;
  [SCREENS.PROFILE]: undefined;
  [SCREENS.EDITLISTING]: {listingId?: string; listingType?: string};
  [SCREENS.CREATE_SERVICE]: {listingId?: string};
  [SCREENS.CREATE_PRODUCT]: {listingId?: string};
  [SCREENS.VERIFT_OTP]: {token: string};
  [SCREENS.OTP_VERIFIED]: undefined;
};

export type BottomTabParamList = {
  [SCREENS.HOME]: undefined;
  [SCREENS.MY_ORDERS]: undefined;
  [SCREENS.PROFILE]: undefined;
};

export type OnBoardingScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  typeof AUTH.ONBOARDING
>;

export type VerifyOtpScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  typeof AUTH.VERIFT_OTP
>;

export type OtpVerifiedScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  typeof AUTH.OTP_VERIFIED
>;

// export type SignupScreenProps = NativeStackScreenProps<
//   AppStackParamList,
//   'SignUp'
// >;
// export type LoginScreenProps = NativeStackScreenProps<
//   AppStackParamList,
//   'Login'
// >;

// export type RecoverPasswordProps = NativeStackScreenProps<
//   AppStackParamList,
//   'RecoverPassword'
// >;
// export type ResetPasswordProps = NativeStackScreenProps<
//   AppStackParamList,
//   'ResetPassword'
// >;
// export type InterestScreenProps = NativeStackScreenProps<
//   AppStackParamList,
//   'InterestSelection'
// >;
// export type RequestLocationScreenProps = NativeStackScreenProps<
//   AppStackParamList,
//   'RequestLocation'
// >;
// export type RequestManuallLocationScreenProps = NativeStackScreenProps<
//   AppStackParamList,
//   'RequestManuallLocation'
// >;
// export type ListingScreenProps = NativeStackScreenProps<
//   AppStackParamList,
//   'Listing'
// >;
// export type SelectLanguageProps = NativeStackScreenProps<
//   AppStackParamList,
//   'SelectLanguage'
// >;
// export type TodaysHotDealsProps = NativeStackScreenProps<
//   AppStackParamList,
//   'TodaysHotDeals'
// >;
// export type MerchantProfileProps = NativeStackScreenProps<
//   AppStackParamList,
//   'MerchantProfile'
// >;
// export type ChatMessageProps = NativeStackScreenProps<
//   AppStackParamList,
//   'ChatMessage'
// >;
