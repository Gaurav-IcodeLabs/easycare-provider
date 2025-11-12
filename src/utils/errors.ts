/**
 * return apiErrors from error response
 */

import {
  ERROR_CODE_TOO_MANY_VERIFICATION_REQUESTS,
  ERROR_CODE_TRANSACTION_ALREADY_REVIEWED_BY_CUSTOMER,
  ERROR_CODE_TRANSACTION_ALREADY_REVIEWED_BY_PROVIDER,
  ERROR_CODE_TRANSACTION_INVALID_TRANSITION,
} from './types';

interface ErrorWithStatus {
  name?: string;
  message?: string;
  status?: number;
  statusText?: string;
}

const responseAPIErrors = error => {
  return error && error.data && error.data.errors ? error.data.errors : [];
};

export const storableError = (err: ErrorWithStatus | any) => {
  const error = err || {};
  const {name, message, status, statusText} = error;
  // Status, statusText, and data.errors are (possibly) added to the error object by SDK
  const apiErrors = responseAPIErrors(error);

  // Returned object is the same as prop type check in util/types -> error
  return {
    type: 'error',
    name,
    message,
    status,
    statusText,
    apiErrors,
  };
};

const errorAPIErrors = error => {
  return error && error.apiErrors ? error.apiErrors : [];
};

const hasErrorWithCode = (error, code) => {
  return errorAPIErrors(error).some(apiError => {
    return apiError.code === code;
  });
};
/**
 * Check if the given API error (from `sdk.transactions.transition(id, transition, params)`)
 * is due to already sent review.
 */
export const isTransactionsTransitionAlreadyReviewed = error =>
  error &&
  error.status === 409 &&
  (hasErrorWithCode(
    error,
    ERROR_CODE_TRANSACTION_ALREADY_REVIEWED_BY_CUSTOMER,
  ) ||
    hasErrorWithCode(
      error,
      ERROR_CODE_TRANSACTION_ALREADY_REVIEWED_BY_PROVIDER,
    ));

/**
 * Check if the given API error (from `sdk.transactions.transition(id, transition, params)`)
 * is due to invalid transition attempt.
 */
export const isTransactionsTransitionInvalidTransition = error =>
  error &&
  error.status === 409 &&
  hasErrorWithCode(error, ERROR_CODE_TRANSACTION_INVALID_TRANSITION);

export const isTooManyEmailVerificationRequestsError = error =>
  hasErrorWithCode(error, ERROR_CODE_TOO_MANY_VERIFICATION_REQUESTS);
