import React, {useCallback, useEffect, useState} from 'react';
import {View, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';
import {AppText} from '../AppText/AppText';
import {Button} from '../Button/Button';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {
  currentUserEmailSelector,
  currentUserEmailVerifiedSelector,
} from '../../slices/user.slice';
import {
  sendVerificationEmail,
  setShowVerifyEmailModal,
  isAuthenticatedSelector,
} from '../../slices/auth.slice';
import {scale} from '../../utils';
import {useLanguage} from '../../hooks';
import {colors} from '../../constants';

export const EmailVerificationModal: React.FC = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const {isArabic} = useLanguage();
  const email = useTypedSelector(currentUserEmailSelector);
  const emailVerified = useTypedSelector(currentUserEmailVerifiedSelector);
  const isAuthenticated = useTypedSelector(isAuthenticatedSelector);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated && emailVerified === false) {
        setIsVisible(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, emailVerified]);

  // Close modal when email becomes verified
  useEffect(() => {
    if (emailVerified === true) {
      setIsVisible(false);
    }
  }, [emailVerified]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    dispatch(setShowVerifyEmailModal(false));
  }, [dispatch]);

  const handleSendVerificationEmail = useCallback(async () => {
    try {
      setIsLoading(true);
      await dispatch(sendVerificationEmail()).unwrap();
      Toast.show({
        type: 'success',
        text1: t('EmailVerification.successTitle'),
        text2: t('EmailVerification.successMessage', {email}),
      });
      handleClose();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('EmailVerification.errorTitle'),
        text2: error?.message || t('EmailVerification.errorMessage'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, email, handleClose, t]);

  return (
    <Modal visible={isVisible} animationType="fade" transparent>
      <View style={styles.modal}>
        <View style={styles.modalInnerContainer}>
          <TouchableOpacity
            onPress={handleClose}
            style={[
              styles.close,
              isArabic ? styles.closeRTL : styles.closeLTR,
            ]}>
            <AppText style={styles.closeText}>✕</AppText>
          </TouchableOpacity>

          <AppText style={[styles.title, {color: colors.black}]}>
            {t('EmailVerification.modalTitle')}
          </AppText>

          <AppText style={[styles.description, {color: colors.lightblack}]}>
            {t('EmailVerification.modalDescription')}
          </AppText>

          <AppText style={[styles.email, {color: colors.black}]}>
            {email}
          </AppText>

          <Button
            title={t('EmailVerification.sendButton')}
            onPress={handleSendVerificationEmail}
            style={styles.button}
            loader={isLoading}
          />

          <TouchableOpacity onPress={handleClose}>
            <AppText style={[styles.laterText, {color: colors.lightblack}]}>
              {t('EmailVerification.laterButton')}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: scale(24),
  },
  modalInnerContainer: {
    backgroundColor: '#fff',
    padding: scale(24),
    borderRadius: scale(20),
    width: '100%',
  },
  close: {
    marginBottom: scale(8),
    padding: scale(4),
  },
  closeLTR: {
    marginLeft: 'auto',
  },
  closeRTL: {
    marginRight: 'auto',
  },
  closeText: {
    fontSize: scale(24),
    color: '#666',
  },
  title: {
    fontSize: scale(20),
    fontWeight: '700',
    marginBottom: scale(12),
    textAlign: 'center',
  },
  description: {
    fontSize: scale(14),
    lineHeight: scale(20),
    marginBottom: scale(12),
    textAlign: 'center',
  },
  email: {
    fontSize: scale(16),
    fontWeight: '600',
    marginBottom: scale(24),
    textAlign: 'center',
  },
  button: {
    marginBottom: scale(12),
  },
  laterText: {
    fontSize: scale(14),
    textAlign: 'center',
    marginTop: scale(8),
    textDecorationLine: 'underline',
  },
});
