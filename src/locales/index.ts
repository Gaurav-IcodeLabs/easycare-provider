import { createInstance } from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import ar from './ar.json';

const LANGUAGE_KEY = '@app_language';

const i18n = createInstance();

const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
};

// Set up RTL immediately based on stored language
const setupRTL = () => {
  try {
    // Try to get stored language synchronously (this might not work on first install)
    AsyncStorage.getItem(LANGUAGE_KEY).then(storedLanguage => {
      const language = storedLanguage || 'en';
      const isRTL = language === 'ar';
      
      // Only force RTL if it's different from current state
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
      }
    });
  } catch (error) {
    console.error('Error setting up RTL:', error);
    // Default to LTR
    I18nManager.allowRTL(false);
    I18nManager.forceRTL(false);
  }
};

// Initialize i18n with stored language or default to English
const initializeI18n = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    const language = storedLanguage || 'en';
    
    i18n
      .use(ICU)
      .use(initReactI18next)
      .init({
        resources,
        lng: language,
        fallbackLng: 'en',
        compatibilityJSON: 'v4',
        interpolation: {
          escapeValue: false,
        },
      });
  } catch (error) {
    console.error('Error initializing i18n:', error);
    // Fallback to English if there's an error
    i18n
      .use(ICU)
      .use(initReactI18next)
      .init({
        resources,
        lng: 'en',
        fallbackLng: 'en',
        compatibilityJSON: 'v4',
        interpolation: {
          escapeValue: false,
        },
      });
  }
};

// Change language function
export const changeLanguage = async (language: 'en' | 'ar') => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    await i18n.changeLanguage(language);
    
    // Set RTL based on language
    const isRTL = language === 'ar';
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    
    return true;
  } catch (error) {
    console.error('Error changing language:', error);
    return false;
  }
};

// Get current language
export const getCurrentLanguage = async (): Promise<'en' | 'ar'> => {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_KEY);
    return (language as 'en' | 'ar') || 'en';
  } catch (error) {
    console.error('Error getting current language:', error);
    return 'en';
  }
};

// Check if current language is RTL
export const isRTL = () => I18nManager.isRTL;

export const mergeTranslations = (translations: any) => ({
  ...en,
  ...translations,
});

// Set up RTL immediately
setupRTL();

// Initialize i18n
initializeI18n();

export default i18n;