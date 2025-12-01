import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {useTranslation} from 'react-i18next';
import {AppText} from '../AppText/AppText';
import {scale as scaleSize} from '../../utils';
import {colors, primaryFont} from '../../constants';
import {BlurView} from '@react-native-community/blur';
import {ListingTypes} from '../../apptypes/interfaces/listing';

type AddOptionsPopoverProps = {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: ListingTypes.SERVICE | ListingTypes.PRODUCT) => void;
};

export const AddOptionsPopover: React.FC<AddOptionsPopoverProps> = ({
  visible,
  onClose,
  onSelectOption,
}) => {
  const {t} = useTranslation();
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 150,
        easing: Easing.out(Easing.ease),
      });
      opacity.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.ease),
      });
    } else {
      translateY.value = withTiming(20, {duration: 100});
      opacity.value = withTiming(0, {duration: 100});
    }
  }, [visible, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
    opacity: opacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.container}>
          <BlurView
            style={styles.blurOverlay}
            blurType="dark"
            blurAmount={2}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.3)">
            <View style={styles.overlay} />
          </BlurView>

          <Animated.View style={[styles.popoverPositioner, animatedStyle]}>
            <TouchableWithoutFeedback>
              <View style={styles.popoverWrapper}>
                {/* Main popover content */}
                <View style={styles.popoverContainer}>
                  <BlurView
                    style={styles.blurBackground}
                    blurType="light"
                    blurAmount={20}
                    reducedTransparencyFallbackColor={'red'}
                  />
                  <View style={styles.tintOverlay} />

                  <View style={styles.optionsRow}>
                    <TouchableOpacity
                      activeOpacity={0.6}
                      onPress={() => {
                        onSelectOption(ListingTypes.SERVICE);
                        onClose();
                      }}
                      style={styles.option}>
                      <AppText style={styles.optionText}>
                        {t('AddOptions.service')}
                      </AppText>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                      activeOpacity={0.6}
                      onPress={() => {
                        onSelectOption(ListingTypes.PRODUCT);
                        onClose();
                      }}
                      style={styles.option}>
                      <AppText style={styles.optionText}>
                        {t('AddOptions.product')}
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
  },
  popoverPositioner: {
    position: 'absolute',
    bottom: scaleSize(100),
    left: scaleSize(32),
  },
  popoverWrapper: {
    alignItems: 'center',
  },
  popoverContainer: {
    backgroundColor: 'transparent',
    borderRadius: scaleSize(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: scaleSize(12),
  },
  tintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: scaleSize(12),
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  option: {
    paddingVertical: scaleSize(10),
    paddingHorizontal: scaleSize(20),
    minWidth: scaleSize(90),
    alignItems: 'center',
  },
  optionText: {
    fontSize: scaleSize(15),
    color: colors.white,
    ...primaryFont('500'),
  },
  divider: {
    width: 1,
    height: scaleSize(20),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});
