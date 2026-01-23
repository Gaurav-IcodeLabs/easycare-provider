import {StorableError} from './userSlice';
export interface AuthState {
  isAuthenticated: boolean;
  signupError: null | StorableError;
  signupInProgress: boolean;
  isLoggedInAs: boolean;
  authScopes: string[];
  authInfoLoaded: boolean;
  loginError: null | StorableError;
  loginInProgress: boolean;
  logoutError: null | StorableError;
  logoutInProgress: boolean;
  showVerifyEmailModal: boolean;
}

export interface SignupParams {
  firstName: string;
  lastName: string;
  email: string;
  displayName?: string;
  password: string;
  protectedData: {
    phoneNumber: string;
  };
  publicData?: {
    userType?: 'provider' | 'customer';
    [key: string]: any;
  };
}

export interface SignupWithIdpParam extends Omit<SignupParams, 'password'> {
  idpToken: string;
  identityProvider: string;
}
export interface LoginThunkParams {
  username: string;
  password: string;
  useEmail?: boolean;
  shouldEnableBiometric?: boolean;
}

export interface CreateUserParams
  extends Pick<
    SignupParams,
    'email' | 'firstName' | 'lastName' | 'displayName'
  > {
  idpToken?: string;
  idpId?: string;
}
