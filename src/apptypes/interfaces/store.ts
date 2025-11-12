import {AppDispatch, RootState} from '../../sharetribeSetup';
import {SDK} from './sdk';

export interface Thunk {
  dispatch: AppDispatch;
  state: RootState;
  extra: SDK;
  rejectValue: AppError;
}

export interface AppError {
  message: string;
  statusCode?: number;
}
