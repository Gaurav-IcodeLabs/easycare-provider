import AsyncStorage from '@react-native-async-storage/async-storage';

const getItemFromAsyncStorage = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (e) {
    throw e;
  }
};

const setItemToAsyncStorage = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    throw e;
  }
};

const removeItemFromAsyncStorage = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    throw e;
  }
};

export {
  getItemFromAsyncStorage,
  removeItemFromAsyncStorage,
  setItemToAsyncStorage,
};
