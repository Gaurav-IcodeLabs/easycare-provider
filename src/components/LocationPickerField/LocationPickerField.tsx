import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity, I18nManager} from 'react-native';
import {AppText} from '../AppText/AppText';
import {colors, primaryFont} from '../../constants';
import {scale} from '../../utils';
import {useTranslation} from 'react-i18next';
import {LocationPickerBottomSheet} from './LocationPickerBottomSheet';

interface LocationPickerFieldProps {
  value: {lat: number; lng: number; address: string} | null | undefined;
  onChange: (location: {lat: number; lng: number; address: string}) => void;
  error?: string;
  types?: string[]; // Mapbox location types to filter results
}

export const LocationPickerField: React.FC<LocationPickerFieldProps> = ({
  value,
  onChange,
  error,
  types,
}) => {
  const {t} = useTranslation();
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const handleSelectLocation = (location: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    onChange(location);
  };

  React.useEffect(() => {
    console.log(
      '🔄 LocationPickerField isBottomSheetVisible:',
      isBottomSheetVisible,
    );
  }, [isBottomSheetVisible]);

  return (
    <View style={styles.container}>
      <AppText style={styles.label}>
        {t('CreateBusiness.locationLabel')}
      </AppText>

      <TouchableOpacity
        style={[styles.inputContainer, error && styles.inputError]}
        onPress={() => {
          console.log('📍 Location field pressed');
          setIsBottomSheetVisible(true);
        }}>
        <View style={styles.contentContainer}>
          <AppText
            style={[styles.addressText, !value && styles.placeholderText]}>
            {value?.address || t('CreateBusiness.selectLocationPlaceholder')}
          </AppText>
        </View>
      </TouchableOpacity>

      {value && (
        <AppText style={styles.coordinatesText}>
          {t('CreateBusiness.coordinates')}: {value.lat.toFixed(4)},{' '}
          {value.lng.toFixed(4)}
        </AppText>
      )}

      {error && <AppText style={styles.errorText}>{error}</AppText>}

      <LocationPickerBottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => {
          console.log('🔒 Closing bottom sheet');
          setIsBottomSheetVisible(false);
        }}
        onSelectLocation={handleSelectLocation}
        types={types}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(16),
  },
  label: {
    fontSize: scale(14),
    color: colors.textBlack,
    marginBottom: scale(8),
    ...primaryFont('500'),
    ...(I18nManager.isRTL && {textAlign: 'left'}),
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(8),
    padding: scale(12),
    backgroundColor: colors.white,
    minHeight: scale(48),
    justifyContent: 'center',
  },
  inputError: {
    borderColor: colors.red,
  },
  contentContainer: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: scale(14),
    color: colors.textBlack,
    flex: 1,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    ...primaryFont('400'),
  },
  placeholderText: {
    color: colors.textGray,
  },
  coordinatesText: {
    fontSize: scale(12),
    color: colors.textGray,
    marginTop: scale(8),
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    ...primaryFont('400'),
  },
  errorText: {
    color: colors.red,
    fontSize: scale(12),
    marginTop: scale(4),
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    ...primaryFont('400'),
  },
});
