import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  I18nManager,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {useTranslation} from 'react-i18next';
import {AppText} from '../AppText/AppText';
import {scale} from '../../utils';
import {colors, primaryFont, secondaryFont} from '../../constants';
import {BlurView} from '@react-native-community/blur';

type AddOptionsModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: 'service' | 'product') => void;
};

export const AddOptionsModal: React.FC<AddOptionsModalProps> = ({
  visible,
  onClose,
  onSelectOption,
}) => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
    } else {
      opacity.value = withTiming(0, {duration: 150});
    }
  }, [visible, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.blurContainer, overlayStyle]}>
            <BlurView
              style={styles.blurView}
              blurType="dark"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.6)"
            />
          </Animated.View>
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.modalContent, animatedStyle]}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalCard, isRTL && styles.modalCardRTL]}>
              <AppText style={[styles.title, isRTL && styles.titleRTL]}>
                {t('AddOptions.title')}
              </AppText>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    onSelectOption('service');
                    onClose();
                  }}
                  style={[styles.button, styles.serviceButton]}>
                  <AppText style={styles.serviceButtonText}>
                    {t('AddOptions.serviceListings')}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    onSelectOption('product');
                    onClose();
                  }}
                  style={[styles.button, styles.productButton]}>
                  <AppText style={styles.productButtonText}>
                    {t('AddOptions.productListings')}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  blurView: {
    flex: 1,
  },
  modalContent: {
    width: '85%',
    maxWidth: scale(340),
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: scale(30),
    padding: scale(24),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: scale(26),
    color: colors.black,
    textAlign: 'center',
    marginBottom: scale(24),
    ...secondaryFont('500'),
    lineHeight: scale(34),
  },
  titleRTL: {
    writingDirection: 'rtl',
  },
  modalCardRTL: {
    direction: 'rtl',
  },
  buttonsContainer: {
    gap: scale(12),
  },
  button: {
    paddingVertical: scale(16),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceButton: {
    backgroundColor: '#00C2FF',
  },
  serviceButtonText: {
    fontSize: scale(16),
    color: colors.white,
    ...primaryFont('600'),
  },
  productButton: {
    backgroundColor: '#003D6B',
  },
  productButtonText: {
    fontSize: scale(16),
    color: colors.white,
    ...primaryFont('600'),
  },
});
