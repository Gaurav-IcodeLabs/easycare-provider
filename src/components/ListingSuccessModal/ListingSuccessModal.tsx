import React from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {scale} from '../../utils';
import {colors, primaryFont, secondaryFont} from '../../constants';
import {AppText} from '../AppText/AppText';
import {useTranslation} from 'react-i18next';
import {Button} from '../Button/Button';
import {success} from '../../assets';

interface ListingSuccessModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ListingSuccessModal: React.FC<ListingSuccessModalProps> = ({
  visible,
  onClose,
}) => {
  const {t} = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <AppText style={styles.closeButtonText}>×</AppText>
              </TouchableOpacity>

              <Image source={success} style={styles.icon} />

              <AppText style={styles.title}>
                {t('ListingSuccessModal.title')}
              </AppText>

              <AppText style={styles.description}>
                {t('ListingSuccessModal.description')}
              </AppText>

              <Button title={t('ListingSuccessModal.done')} onPress={onClose} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: scale(24),
    paddingHorizontal: scale(24),
    paddingTop: scale(40),
    paddingBottom: scale(32),
    width: '100%',
    maxWidth: scale(400),
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: scale(16),
    right: scale(16),
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: scale(24),
    color: colors.grey,
    ...primaryFont('400'),
    lineHeight: scale(24),
  },
  icon: {
    height: scale(90),
    width: scale(120),
    alignSelf: 'center',
    marginBottom: scale(16),
  },
  title: {
    fontSize: scale(22),
    color: colors.textBlack,
    ...secondaryFont('600'),
    textAlign: 'center',
    marginBottom: scale(12),
    lineHeight: scale(30),
  },
  description: {
    fontSize: scale(14),
    color: colors.grey,
    ...primaryFont('400'),
    textAlign: 'center',
    marginBottom: scale(32),
    lineHeight: scale(20),
    paddingHorizontal: scale(8),
  },
});
