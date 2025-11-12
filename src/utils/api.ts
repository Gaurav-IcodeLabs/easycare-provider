import apiClient from './api.helper';

// Dummy GET API call
export const getDummyData = () => apiClient.get('/dummy-endpoint');

// Dummy POST API call
export const postDummyData = (data: any) =>
  apiClient.post('/dummy-endpoint', data);

export const checkPhoneNumberExists = (data: any) =>
  apiClient.post('/api/check_phone_number_exists', data);
