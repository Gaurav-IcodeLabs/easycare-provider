import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {AuthState, LoginThunkParams, SignupParams, Thunk} from '../apptypes';
import {resetAllSlices, RootState} from '../sharetribeSetup';
import {storableError} from '../utils';
import {checkPhoneNumberExists} from '../utils/api';

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
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(resetAllSlices, () => initialState);

    builder.addCase(authInfo.pending, () => {
      console.log('authInfo.pending');
    });
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

    builder.addCase(logout.pending, state => {
      state.logoutInProgress = true;
      state.isAuthenticated = false;
      state.isLoggedInAs = false;
      state.authScopes = [];
    });
    builder.addCase(logout.fulfilled, state => {
      state.logoutInProgress = false;
      state.isAuthenticated = false;
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.logoutInProgress = false;
      state.logoutError = storableError(action.error as any);
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
  async (params, {extra: sdk, rejectWithValue}) => {
    try {
      const {phoneNumber} = params?.protectedData;
      const {phoneNumberExists} = await checkPhoneNumberExists({
        phoneNumber,
      });
      if (phoneNumberExists) {
        return rejectWithValue({
          message: 'Phone number already exists',
          statusCode: 409,
        });
      }
      const res = await sdk.currentUser.create(params);
      return res;
    } catch (error: any) {
      const message = error?.message || 'Signup failed';
      const statusCode = error?.response?.status || error?.status;
      return rejectWithValue({message, statusCode});
    }
  },
);

export const login = createAsyncThunk<{}, LoginThunkParams, Thunk>(
  'auth/loginStatus',
  async (params, {extra: sdk, rejectWithValue}) => {
    try {
      const currentUser = await sdk.login(params);
      return currentUser;
    } catch (error: any) {
      const message = error?.message || 'Login failed';
      const statusCode = error?.response?.status || error?.status;
      return rejectWithValue({message, statusCode});
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

export const {} = authSlice.actions;

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

export default authSlice.reducer;
