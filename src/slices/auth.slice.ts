import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {AuthState, LoginThunkParams, SignupParams, Thunk} from '../apptypes';
import {resetAllSlices, RootState} from '../sharetribeSetup';
import {storableError} from '../utils';
import {
  checkPhoneNumberExists,
  getEmailWithPhoneNumber,
  sendOTP,
} from '../utils/api';
import {disableBiometricLogin} from '../utils/biometricAuth';
import {updateAppState} from './app.slice';

const authenticated = (authInfo: AuthInfoResponse) =>
  authInfo?.isAnonymous === false;
const loggedInAs = (authInfo: AuthInfoResponse) =>
  authInfo?.isLoggedInAs === true;

const initialState: AuthState = {
  isAuthenticated: false,

  // is marketplace operator logged in as a marketplace user
  isLoggedInAs: false,

  // scopes associated with current token
  authScopes: [],

  // auth info
  authInfoLoaded: false,

  // login
  loginError: null,
  loginInProgress: false,

  // logout
  logoutError: null,
  logoutInProgress: false,

  // signup
  signupError: null,
  signupInProgress: false,

  // email verification modal
  showVerifyEmailModal: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setShowVerifyEmailModal: (state, action) => {
      state.showVerifyEmailModal = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(resetAllSlices, () => initialState);

    builder.addCase(authInfo.pending, () => {});
    builder.addCase(authInfo.fulfilled, (state, {payload}) => {
      state.authInfoLoaded = true;
      state.isAuthenticated = authenticated(payload);
      state.isLoggedInAs = loggedInAs(payload);
      state.authScopes = payload.authScopes;
    });
    builder.addCase(authInfo.rejected, (state, action) => {
      state.logoutInProgress = false;
      state.logoutError = storableError(action.error as any);
    });

    builder.addCase(signup.pending, state => {
      state.signupInProgress = true;
      state.signupError = null;
    });
    builder.addCase(signup.fulfilled, state => {
      state.signupInProgress = false;
      state.isAuthenticated = true;
    });
    builder.addCase(signup.rejected, (state, action) => {
      state.signupError = storableError(action.error as any);
      state.signupInProgress = false;
    });

    builder.addCase(signupWithIdp.pending, state => {
      state.signupInProgress = true;
      state.signupError = null;
    });
    builder.addCase(signupWithIdp.fulfilled, state => {
      state.signupInProgress = false;
      state.isAuthenticated = true;
    });
    builder.addCase(signupWithIdp.rejected, (state, action) => {
      state.signupError = storableError(action.error as any);
      state.signupInProgress = false;
    });

    builder.addCase(login.pending, state => {
      state.loginInProgress = true;
      state.loginError = null;
    });
    builder.addCase(login.fulfilled, state => {
      state.loginInProgress = false;
      state.isAuthenticated = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loginInProgress = false;
      state.loginError = storableError(action.error as any);
    });

    builder.addCase(loginWithIdp.pending, state => {
      state.loginInProgress = true;
      state.loginError = null;
    });
    builder.addCase(loginWithIdp.fulfilled, state => {
      state.loginInProgress = false;
      state.isAuthenticated = true;
    });
    builder.addCase(loginWithIdp.rejected, (state, action) => {
      state.loginInProgress = false;
      state.loginError = storableError(action.error as any);
    });

    builder.addCase(logout.pending, state => {
      state.logoutInProgress = true;
      state.isAuthenticated = false;
      state.isLoggedInAs = false;
      state.authScopes = [];
    });
    builder.addCase(logout.fulfilled, state => {
      state.logoutInProgress = false;
      state.isAuthenticated = false;
      // Reset modal state on logout
      state.showVerifyEmailModal = false;
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.logoutInProgress = false;
      state.logoutError = storableError(action.error as any);
    });

    builder.addCase(verifyEmail.pending, state => {
      state.showVerifyEmailModal = true;
    });
    builder.addCase(verifyEmail.fulfilled, state => {
      state.showVerifyEmailModal = false;
    });
    builder.addCase(verifyEmail.rejected, state => {
      state.showVerifyEmailModal = false;
    });
  },
});

interface AuthInfoResponse {
  isAnonymous: boolean;
  isLoggedInAs?: boolean;
  authScopes: string[];
  grantType?: string;
}

export const authInfo = createAsyncThunk<AuthInfoResponse, void, Thunk>(
  'auth/authInfo',
  async (_, {extra: sdk, rejectWithValue}) => {
    try {
      const info = await sdk.authInfo();
      return info;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch auth info';
      return rejectWithValue({message});
    }
  },
);

export const signup = createAsyncThunk<{}, SignupParams, Thunk>(
  'auth/signup',
  async (params, {dispatch, extra: sdk, rejectWithValue}) => {
    try {
      const {phoneNumber} = params?.protectedData;
      const response = await checkPhoneNumberExists({
        phoneNumber,
      });
      const phoneNumberExists = (response as any)?.phoneNumberExists;

      if (phoneNumberExists) {
        return rejectWithValue({
          message: 'Phone number already exists',
          statusCode: 409,
        });
      }

      // Add userType: 'provider' to publicData
      const signupParams = {
        ...params,
        publicData: {
          ...params?.publicData,
          userType: 'provider',
        },
      };

      const res = await sdk.currentUser.create(signupParams);

      // Explicitly login to ensure token is stored
      await sdk.login({
        username: params.email,
        password: params.password,
      });

      // Always clear biometric credentials for new user signup
      try {
        await disableBiometricLogin();
        dispatch(updateAppState({key: 'biometricEnabled', value: false}));
      } catch (error) {
        // Ignore errors when clearing biometric data
      }

      // Refresh auth info to update Redux state
      await dispatch(authInfo() as any);
      await sendOTP({phoneNumber});
      return res;
    } catch (error: any) {
      const message = error?.message || 'Signup failed';
      const statusCode = error?.response?.status || error?.status;
      return rejectWithValue({message, statusCode});
    }
  },
);

export const signupWithIdp = createAsyncThunk<
  {},
  {
    idpId: string;
    idpClientId: string;
    idpToken: string;
    email: string;
    firstName: string;
    lastName: string;
  },
  Thunk
>(
  'auth/signupWithIdp',
  async (params, {dispatch, extra: sdk, rejectWithValue}) => {
    try {
      // Create user with IDP
      const res = await sdk.currentUser.createWithIdp({
        ...params,
        publicData: {
          userType: 'provider',
        },
      });

      // After successful signup, authenticate the user
      await (sdk as any).loginWithIdp({
        idpId: params.idpId,
        idpClientId: params.idpClientId,
        idpToken: params.idpToken,
      });

      // Always clear biometric credentials for IDP signup
      try {
        await disableBiometricLogin();
        dispatch(updateAppState({key: 'biometricEnabled', value: false}));
      } catch (error) {
        // Ignore errors when clearing biometric data
      }

      // Refresh auth info after successful signup
      await dispatch(authInfo() as any);

      return res.data;
    } catch (error: any) {
      const statusCode = error?.response?.status || error?.status;
      const errorData = error?.response?.data;
      const errorCode = errorData?.code || errorData?.error || error?.code;
      const message =
        errorData?.message || error?.message || 'IDP signup failed';

      return rejectWithValue({
        message,
        statusCode,
        ...(errorCode && {code: errorCode}),
      } as any);
    }
  },
);

export const login = createAsyncThunk<{}, LoginThunkParams, Thunk>(
  'auth/loginStatus',
  async (
    {useEmail = false, username, password, isBiometricLogin = false},
    {dispatch, extra: sdk, rejectWithValue},
  ) => {
    try {
      let email: string = '';
      // Get email from phone number
      if (!useEmail) {
        const emailResponse = await getEmailWithPhoneNumber({
          phoneNumber: username,
        });
        email = (emailResponse as any)?.email;

        if (!email) {
          return rejectWithValue({
            message: 'Phone number not found',
            statusCode: 404,
          });
        }
      }

      const loginEmail = useEmail ? username : email;

      // Login with email and password
      const currentUser = await sdk.login({
        username: loginEmail,
        password: password,
      });

      const userResponse = await sdk.currentUser.show();
      const user = userResponse.data.data;
      const userType = (user?.attributes?.profile?.publicData as any)?.userType;
      if (userType !== 'provider') {
        await sdk.logout();
        return rejectWithValue({
          message: 'Only providers can access this app',
          statusCode: 403,
        } as any);
      }

      // Only clear biometric credentials if NOT using biometric login
      if (!isBiometricLogin) {
        try {
          await disableBiometricLogin();
          dispatch(updateAppState({key: 'biometricEnabled', value: false}));
        } catch (error) {
          // Ignore errors when clearing biometric data
        }
      }

      return currentUser;
    } catch (error: any) {
      const message = error?.message || 'Login failed';
      const statusCode = error?.response?.status || error?.status;
      return rejectWithValue({message, statusCode});
    }
  },
);

export const loginWithIdp = createAsyncThunk<
  {},
  {
    idpId: string;
    idpClientId: string;
    idpToken: string;
  },
  Thunk
>(
  'auth/loginWithIdp',
  async (params, {dispatch, extra: sdk, rejectWithValue}) => {
    try {
      const currentUser = await (sdk as any).loginWithIdp(params);

      // Fetch current user to check userType
      const userResponse = await sdk.currentUser.show();
      const user = userResponse.data.data;
      const userType = (user?.attributes?.profile?.publicData as any)?.userType;

      // Only allow providers to login
      if (userType !== 'provider') {
        await sdk.logout();
        return rejectWithValue({
          message: 'Only providers can access this app',
          statusCode: 403,
        });
      }

      // Always clear biometric credentials for IDP login
      try {
        await disableBiometricLogin();
        dispatch(updateAppState({key: 'biometricEnabled', value: false}));
      } catch (error) {
        // Ignore errors when clearing biometric data
      }

      return currentUser.data;
    } catch (error: any) {
      const statusCode = error?.response?.status || error?.status;
      const errorData = error?.response?.data;
      const errorCode = errorData?.code || errorData?.error || error?.code;
      const message =
        errorData?.message || error?.message || 'IDP login failed';

      return rejectWithValue({
        message,
        statusCode,
        ...(errorCode && {code: errorCode}),
      } as any);
    }
  },
);

export const logout = createAsyncThunk<{}, void, Thunk>(
  'auth/logout',
  async (_, {extra: sdk, rejectWithValue}) => {
    try {
      await sdk.logout();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      return rejectWithValue({message});
    }
  },
);

export const verifyEmail = createAsyncThunk<
  void,
  {verificationToken: string},
  Thunk
>(
  'auth/verifyEmail',
  async ({verificationToken}, {dispatch, extra: sdk, rejectWithValue}) => {
    try {
      await sdk.currentUser.verifyEmail({verificationToken});
      // Refresh current user to get updated emailVerified status
      const {fetchCurrentUser} = await import('./user.slice');
      await dispatch(fetchCurrentUser({}) as any);
    } catch (error: any) {
      return rejectWithValue({
        message: error?.message || 'Failed to verify email',
      });
    }
  },
);

export const sendVerificationEmail = createAsyncThunk<void, void, Thunk>(
  'auth/sendVerificationEmail',
  async (_, {extra: sdk, rejectWithValue}) => {
    try {
      await sdk.currentUser.sendVerificationEmail();
    } catch (error: any) {
      return rejectWithValue({
        message: error?.message || 'Failed to send verification email',
      });
    }
  },
);

export const {setShowVerifyEmailModal} = authSlice.actions;

export const loginInProgressSelector = (state: RootState) =>
  state.auth.loginInProgress;
export const loginErrorSelector = (state: RootState) => state.auth.loginError;
export const signUpInProgressSelector = (state: RootState) =>
  state.auth.signupInProgress;
export const signUpErrorSelector = (state: RootState) => state.auth.signupError;
export const logoutInProgressSelector = (state: RootState) =>
  state.auth.logoutInProgress;
export const isAuthenticatedSelector = (state: RootState) =>
  state.auth.isAuthenticated;
export const showVerifyEmailModalSelector = (state: RootState) =>
  state.auth.showVerifyEmailModal;

export default authSlice.reducer;
