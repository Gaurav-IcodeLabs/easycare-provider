import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import {BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import {GOOGLE_MAPS_API_KEY} from '@env';
import {useTranslation} from 'react-i18next';
import {useLanguage} from '../../hooks';
import {AppText} from '../AppText/AppText';
import {BottomSheetBackDropComponent} from '../BottomSheetBackDropComponent/BottomSheetBackDropComponent';
import {colors, primaryFont} from '../../constants';
import {height, scale} from '../../utils';

const AUTOCOMPLETE_URL =
  'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

/** Add/remove country codes here for testing */
const SEARCH_COUNTRIES = ['sa', 'in']; // 'in' for India testing

const COMPONENTS_PARAM = SEARCH_COUNTRIES.map(c => `country:${c}`).join('|');

interface LocationResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text?: string;
  };
}

interface SelectedLocation {
  lat: number;
  lng: number;
  address: string;
}

interface LocationPickerBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectLocation: (location: SelectedLocation) => void;
  /**
   * Google Places types filter.
   * e.g. ['address'], ['establishment'], ['geocode']
   * Leave undefined to return all types.
   * Full list: https://developers.google.com/maps/documentation/places/web-service/supported_types
   */
  types?: string[];
}

export const LocationPickerBottomSheet: React.FC<
  LocationPickerBottomSheetProps
> = ({isVisible, onClose, onSelectLocation}) => {
  const {t} = useTranslation();
  const {currentLanguage} = useLanguage();

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastQueriedRef = useRef<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => bottomSheetRef.current?.present(), 100);
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible]);

  const resetState = useCallback(() => {
    abortControllerRef.current?.abort();
    setSearchQuery('');
    setResults([]);
    lastQueriedRef.current = '';
  }, []);

  const searchLocations = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setResults([]);
      return;
    }

    // Skip duplicate queries (e.g. re-focus without typing)
    if (trimmed === lastQueriedRef.current) return;
    // Cancel previous in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    lastQueriedRef.current = trimmed;
    setIsLoading(true);

    try {
      let url =
        `${AUTOCOMPLETE_URL}` +
        `?input=${encodeURIComponent(trimmed)}` +
        `&key=${GOOGLE_MAPS_API_KEY}` +
        `&language=${currentLanguage}` +
        `&components=${COMPONENTS_PARAM}`;

      const response = await fetch(url, {signal: controller.signal});
      console.log('response', JSON.stringify(response));
      const data = await response.json();

      if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
        setResults(data.predictions ?? []);
      } else {
        console.warn(
          '[Places] Autocomplete error:',
          data.status,
          data.error_message,
        );
        setResults([]);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('[Places] Search failed:', error);
        setResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setResults([]);
      lastQueriedRef.current = '';
      return;
    }

    const timeoutId = setTimeout(() => searchLocations(trimmed), 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchLocations]);

  const handleSelectLocation = useCallback(
    async (item: LocationResult) => {
      setIsFetchingDetails(true);
      try {
        const url =
          `${DETAILS_URL}` +
          `?place_id=${item.place_id}` +
          `&key=${GOOGLE_MAPS_API_KEY}` +
          `&fields=geometry,formatted_address` + // only fetch what you need — saves cost
          `&language=${currentLanguage}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK') {
          const {lat, lng} = data.result.geometry.location;
          onSelectLocation({
            lat,
            lng,
            address: data.result.formatted_address ?? item.description,
          });
        } else {
          console.warn('[Places] Details error:', data.status);
        }
      } catch (error) {
        console.error('[Places] Details fetch failed:', error);
      } finally {
        setIsFetchingDetails(false);
        resetState();
        onClose();
      }
    },
    [currentLanguage, onSelectLocation, onClose, resetState],
  );

  // ── Dismiss ───────────────────────────────────────────────────────────────

  const handleDismiss = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  // ── Render item ───────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({item}: {item: LocationResult}) => (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => handleSelectLocation(item)}
        disabled={isFetchingDetails}>
        <AppText style={[styles.resultTitle, styles.rtlText]}>
          {item.structured_formatting?.main_text ?? item.description}
        </AppText>
        {item.structured_formatting?.secondary_text ? (
          <AppText style={[styles.resultSubtitle, styles.rtlText]}>
            {item.structured_formatting.secondary_text}
          </AppText>
        ) : null}
      </TouchableOpacity>
    ),
    [handleSelectLocation, isFetchingDetails],
  );

  // ── Derived state (avoids multiple condition blocks in JSX) ───────────────

  const isBusy = isLoading || isFetchingDetails;
  const showStartTyping = !isBusy && searchQuery.trim().length === 0;
  const showNoResults =
    !isBusy && searchQuery.trim().length > 0 && results.length === 0;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      enableDynamicSizing
      enablePanDownToClose
      onDismiss={handleDismiss}
      backdropComponent={BottomSheetBackDropComponent}
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
            placeholderTextColor={colors.textBlack}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>

        {isBusy && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.deepBlue} />
          </View>
        )}

        {(showStartTyping || showNoResults) && (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>
              {showNoResults
                ? t('CreateBusiness.noLocationsFound')
                : t('CreateBusiness.startTypingToSearch')}
            </AppText>
          </View>
        )}

        <FlatList
          data={results}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item.place_id}
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
    color: colors.textBlack,
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
    color: colors.textBlack,
    ...primaryFont('400'),
  },
  rtlText: {
    textAlign: 'left',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
});
