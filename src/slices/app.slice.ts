import {createSlice} from '@reduxjs/toolkit';
import {RootState} from '../sharetribeSetup';

interface InitialState {
  skipOnboarding: boolean;
}

const initialState: InitialState = {
  skipOnboarding: false,
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

export const {updateAppState} = appSlice.actions;

export default appSlice.reducer;
