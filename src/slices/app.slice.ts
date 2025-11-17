import {createSlice} from '@reduxjs/toolkit';
import {RootState} from '../sharetribeSetup';

interface InitialState {
  skipOnboarding: boolean;
  biometricAvailable: boolean;
  biometricType: string;
  biometricEnabled: boolean;
}

const initialState: InitialState = {
  skipOnboarding: false,
  biometricAvailable: false,
  biometricType: '',
  biometricEnabled: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    updateAppState: <K extends keyof InitialState>(
      state: InitialState,
      {payload}: {payload: {key: K; value: InitialState[K]}},
    ) => {
      state[payload.key] = payload.value;
    },
  },
});

export const skipOnboardingSelector = (state: RootState) =>
  state.app.skipOnboarding;

export const biometricAvailableSelector = (state: RootState) =>
  state.app.biometricAvailable;

export const biometricTypeSelector = (state: RootState) =>
  state.app.biometricType;

export const biometricEnabledSelector = (state: RootState) =>
  state.app.biometricEnabled;

export const {updateAppState} = appSlice.actions;

export default appSlice.reducer;
