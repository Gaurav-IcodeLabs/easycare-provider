import React, {useState, useCallback, useMemo, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import {AppText} from '../AppText/AppText';
import {colors, primaryFont} from '../../constants';
import {height, scale} from '../../utils';
import {MAPBOX_ACCESS_TOKEN} from '@env';
import {useTranslation} from 'react-i18next';

interface LocationResult {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  text: string;
}

interface LocationPickerBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectLocation: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => void;
  types?: string[]; // Mapbox location types: address, place, poi, locality, neighborhood, etc.
}

export const LocationPickerBottomSheet: React.FC<
  LocationPickerBottomSheetProps
> = ({isVisible, onClose, onSelectLocation, types}) => {
  const {t} = useTranslation();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('🔄 isVisible changed:', isVisible);
    console.log('📋 bottomSheetRef.current:', bottomSheetRef.current);
    if (isVisible) {
      console.log('🚀 Attempting to present bottom sheet');
      // Add a small delay to ensure ref is ready
      setTimeout(() => {
        console.log('📋 bottomSheetRef after timeout:', bottomSheetRef.current);
        bottomSheetRef.current?.present();
      }, 100);
    } else {
      console.log('❌ Attempting to dismiss bottom sheet');
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible]);

  const searchLocations = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Build URL with optional types parameter
        let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query,
        )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=10`;

        // Add types filter if provided
        // Available types: country, region, postcode, district, place, locality, neighborhood, address, poi
        if (types && types.length > 0) {
          url += `&types=${types.join(',')}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        setResults(data.features || []);
      } catch (error) {
        console.error('Error searching locations:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [types],
  );

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchLocations]);

  const handleSelectLocation = (item: LocationResult) => {
    onSelectLocation({
      lat: item.center[1],
      lng: item.center[0],
      address: item.place_name,
    });
    setSearchQuery('');
    setResults([]);
    onClose();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const renderItem = ({item}: {item: LocationResult}) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectLocation(item)}>
      <AppText style={[styles.resultTitle, styles.rtlText]}>
        {item.place_name}
      </AppText>
      <AppText style={[styles.resultSubtitle, styles.rtlText]}>
        {item.text}
      </AppText>
    </TouchableOpacity>
  );

  const handleDismiss = useCallback(() => {
    console.log('👋 Bottom sheet dismissed');
    setSearchQuery('');
    setResults([]);
    onClose();
  }, [onClose]);

  console.log('🎨 Rendering BottomSheetModal, ref:', bottomSheetRef.current);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      enableDynamicSizing
      enablePanDownToClose
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      enableDismissOnClose>
      <BottomSheetView style={styles.container}>
        <AppText style={styles.title}>
          {t('CreateBusiness.selectLocation')}
        </AppText>

        <View style={styles.searchContainer}>
          <BottomSheetTextInput
            style={styles.searchInput}
            placeholder={t('CreateBusiness.searchLocation')}
            placeholderTextColor={colors.textGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.deepBlue} />
          </View>
        )}

        {!isLoading && results.length === 0 && searchQuery.trim() !== '' && (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>
              {t('CreateBusiness.noLocationsFound')}
            </AppText>
          </View>
        )}

        {!isLoading && results.length === 0 && searchQuery.trim() === '' && (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>
              {t('CreateBusiness.startTypingToSearch')}
            </AppText>
          </View>
        )}

        <FlatList
          data={results}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item.id}
          style={styles.resultsList}
          contentContainerStyle={styles.resultsListContent}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
  },
  handleIndicator: {
    backgroundColor: colors.lightGrey,
    width: scale(40),
    height: scale(4),
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
    maxHeight: height / 1.2,
  },
  title: {
    fontSize: scale(20),
    color: colors.textBlack,
    marginBottom: scale(16),
    ...(I18nManager.isRTL && {textAlign: 'left'}),
    alignSelf: 'stretch',
    ...primaryFont('600'),
  },
  searchContainer: {
    marginBottom: scale(16),
  },
  searchInput: {
    height: scale(48),
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: scale(8),
    paddingHorizontal: scale(16),
    fontSize: scale(16),
    color: colors.textBlack,
    backgroundColor: colors.white,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    ...primaryFont('400'),
  },
  loadingContainer: {
    paddingVertical: scale(40),
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: scale(40),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: scale(14),
    color: colors.textGray,
    textAlign: 'center',
    ...primaryFont('400'),
  },
  resultsList: {
    flex: 1,
  },
  resultsListContent: {
    paddingBottom: scale(50),
  },
  resultItem: {
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    flexDirection: 'column',
  },
  resultTitle: {
    fontSize: scale(16),
    color: colors.textBlack,
    marginBottom: scale(4),
    ...primaryFont('500'),
  },
  resultSubtitle: {
    fontSize: scale(14),
    color: colors.textGray,
    ...primaryFont('400'),
  },
  rtlText: {
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
});
