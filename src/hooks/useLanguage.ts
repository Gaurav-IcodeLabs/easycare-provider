import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import { changeLanguage, getCurrentLanguage } from '../locales';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ar'>('en');
  const [isRTLLayout, setIsRTLLayout] = useState(I18nManager.isRTL);

  useEffect(() => {
    const initLanguage = async () => {
      const lang = await getCurrentLanguage();
      setCurrentLanguage(lang);
      setIsRTLLayout(I18nManager.isRTL);
    };
    
    initLanguage();
  }, []);

  const switchLanguage = async (language: 'en' | 'ar') => {
    const success = await changeLanguage(language);
    if (success) {
      setCurrentLanguage(language);
      // Note: RTL state will only change after app restart
      return true;
    }
    return false;
  };

  return {
    currentLanguage,
    isRTLLayout,
    switchLanguage,
    isArabic: currentLanguage === 'ar',
    isEnglish: currentLanguage === 'en',
  };
};