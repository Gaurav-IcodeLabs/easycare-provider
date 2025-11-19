import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYCHAIN_SERVICE = 'com.easycare.biometric';
const BIOMETRIC_ENABLED_KEY = '@biometric_enabled';

const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: true,
});

export interface BiometricCredentials {
  username: string;
  password: string;
}

/**
 * Check if biometric authentication is available on the device
 */
export const isBiometricAvailable = async (): Promise<{
  available: boolean;
  biometryType?: string;
}> => {
  try {
    const {available, biometryType} = await rnBiometrics.isSensorAvailable();
    return {available, biometryType};
  } catch (error) {
    return {available: false};
  }
};

/**
 * Check if user has enabled biometric login
 * Uses AsyncStorage flag to avoid triggering biometric prompt
 */
export const isBiometricEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    return false;
  }
};

/**
 * Enable biometric login and store credentials securely in Keychain
 */
export const enableBiometricLogin = async (
  credentials: BiometricCredentials,
): Promise<void> => {
  try {
    await Keychain.setGenericPassword(
      credentials.username,
      credentials.password,
      {
        service: KEYCHAIN_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
      },
    );
    // Set flag in AsyncStorage to check enabled status without triggering biometric
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
  } catch (error) {
    throw error;
  }
};

/**
 * Disable biometric login and remove stored credentials from Keychain
 */
export const disableBiometricLogin = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({
      service: KEYCHAIN_SERVICE,
    });
    // Remove flag from AsyncStorage
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
  } catch (error) {
    throw error;
  }
};

/**
 * Authenticate with biometrics and retrieve stored credentials from Keychain
 */
export const authenticateWithBiometrics = async (
  promptMessage: string,
): Promise<BiometricCredentials | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
      authenticationPrompt: {
        title: promptMessage,
        cancel: 'Cancel',
      },
    });

    if (credentials && credentials.username && credentials.password) {
      return {
        username: credentials.username,
        password: credentials.password,
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Verify biometric authentication capability (for setup)
 * Tests if the user can authenticate with biometrics
 */
export const verifyBiometricAuthentication = async (
  promptMessage: string,
): Promise<boolean> => {
  try {
    const {success} = await rnBiometrics.simplePrompt({
      promptMessage,
      cancelButtonText: 'Cancel',
    });
    return success;
  } catch (error) {
    return false;
  }
};

/**
 * Get biometry type name for display
 */
export const getBiometryTypeName = (biometryType?: string | null): string => {
  if (!biometryType) {
    return '';
  }

  if (biometryType === BiometryTypes.FaceID) {
    return 'Face ID';
  }

  if (biometryType === BiometryTypes.TouchID) {
    return 'Touch ID';
  }

  if (biometryType === BiometryTypes.Biometrics) {
    return 'Biometrics';
  }

  return '';
};
