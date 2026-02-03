import React from 'react';
import {StyleSheet, Pressable} from 'react-native';
import {useTranslation} from 'react-i18next';
import Popover from 'react-native-popover-view';
import {AppText} from '../AppText/AppText';
import {scale as scaleSize} from '../../utils';
import {colors, primaryFont} from '../../constants';

type ListingMenuPopoverProps = {
  visible: boolean;
  onClose: () => void;
  onToggleStatus: () => void;
  isPublished: boolean;
  isClosed: boolean;
  fromView: React.RefObject<any>;
};

export const ListingMenuPopover: React.FC<ListingMenuPopoverProps> = ({
  visible,
  onClose,
  onToggleStatus,
  isPublished,
  isClosed,
  fromView,
}) => {
  const {t} = useTranslation();

  // Only show menu if listing is published or closed
  const shouldShowMenu = isPublished || isClosed;

  if (!shouldShowMenu) {
    return null;
  }

  const handlePress = () => {
    onToggleStatus();
    onClose();
  };

  return (
    <Popover
      isVisible={visible}
      onRequestClose={onClose}
      from={fromView}
      popoverStyle={styles.popoverContainer}>
      <Pressable
        onPress={handlePress}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        style={({pressed}) => [styles.option, pressed && styles.optionPressed]}>
        <AppText style={styles.optionText}>
          {isPublished
            ? t('ListingCard.closedToggle')
            : t('ListingCard.openToggle')}
        </AppText>
      </Pressable>
    </Popover>
  );
};

const styles = StyleSheet.create({
  popoverContainer: {
    backgroundColor: colors.white,
    borderRadius: scaleSize(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minWidth: scaleSize(120),
  },
  option: {
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(20),
    alignItems: 'center',
  },
  optionPressed: {
    backgroundColor: colors.lightGrey,
  },
  optionText: {
    fontSize: scaleSize(15),
    color: colors.textBlack,
    ...primaryFont('500'),
  },
});
