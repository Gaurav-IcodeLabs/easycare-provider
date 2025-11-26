import {CurrentUser} from './sdk';

export interface UserState {
  currentUser: null | CurrentUser;
  currentUserShowError: StorableError | null;
  updateCurrentUserError: null | StorableError;
  updateCurrentUserInProgress: boolean;
}

export interface StorableError {
  type: string;
  name: string;
  message: string;
  status: number;
  statusText: string;
  apiErrors: string[];
}
