import apiClient from './api.helper';

// Dummy GET API call
export const getDummyData = () => apiClient.get('/dummy-endpoint');

// Dummy POST API call
export const postDummyData = (data: any) =>
  apiClient.post('/dummy-endpoint', data);

export const checkPhoneNumberExists = (data: any) =>
  apiClient.post<{phoneNumberExists: boolean}>(
    '/api/check_phone_number_exists',
    data,
  );

export const getEmailWithPhoneNumber = (data: any) =>
  apiClient.post<{email: string}>('/api/email_by_phone_number', data);

// export const createUserWithIdp = (data: {
//   idpId: string;
//   idpClientId: string;
//   idpToken: string;
//   email: string;
//   firstName: string;
//   lastName: string;
// }) => apiClient.post('/api/auth/create-user-with-idp', data);

export const createOpenIdpToken = (data: {
  email: string;
  firstName?: string;
  lastName?: string;
  email_verified?: boolean;
}) =>
  apiClient.post<{idpToken: string; userExists: boolean}>(
    '/api/auth/create-open-idp-token',
    data,
  );

export const sendOTP = (data: {phoneNumber: string}) =>
  apiClient.post('/api/otp/send', {recipient: data.phoneNumber});

export const verifyOTP = (data: {phoneNumber: string; code: string}) =>
  apiClient.post('/api/otp/verify', {to: data.phoneNumber, code: data.code});

export const linkProductToService = (data: any) =>
  apiClient.post('/api/listing/link-service', data);

export const updatelinkedProductToService = (data: any) =>
  apiClient.post('/api/listing/update-linked-service', data);
