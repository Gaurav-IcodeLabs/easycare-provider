import React, {FC, useState} from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  I18nManager,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {AppText, Button, GradientWrapper} from '../../../components';
import {RadioButton} from '../../../components/RadioButton';
import {colors, primaryFont} from '../../../constants';
import {scale, fontScale, formatDateRange} from '../../../utils';
import {CalendarPicker} from './CalendarPicker';

interface AddExceptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (exception: {
    startDate: string;
    endDate: string;
    available: boolean;
  }) => void;
  existingExceptions?: Array<{
    id: string;
    startDate: string;
    endDate: string;
    available: boolean;
  }>;
}

export const AddExceptionModal: FC<AddExceptionModalProps> = ({
  visible,
  onClose,
  onSave,
  existingExceptions = [],
}) => {
  const {t} = useTranslation();
  const [available, setAvailable] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  // Calculate all dates that are already covered by exceptions or in the past
  const getDisabledDates = () => {
    const disabledDates: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add past dates (last 365 days)
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(today.getDate() - 365);

    const pastDate = new Date(oneYearAgo);
    while (pastDate < today) {
      disabledDates.push(pastDate.toISOString().split('T')[0]);
      pastDate.setDate(pastDate.getDate() + 1);
    }

    // Add dates covered by existing exceptions
    existingExceptions.forEach(exception => {
      const start = new Date(exception.startDate);
      const end = new Date(exception.endDate);

      // Add all dates in the range
      const current = new Date(start);
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        if (!disabledDates.includes(dateStr)) {
          disabledDates.push(dateStr);
        }
        current.setDate(current.getDate() + 1);
      }
    });

    return disabledDates;
  };

  const disabledDates = getDisabledDates();

  const handleSave = () => {
    console.log('💾 Saving exception:', {startDate, endDate, available});

    if (!startDate || !endDate) {
      console.warn('⚠️ Missing dates - cannot save');
      return;
    }

    onSave({
      startDate,
      endDate,
      available,
    });

    console.log('✅ Exception saved, resetting form');

    // Reset form
    setAvailable(false);
    setStartDate('');
    setEndDate('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}>
      <GradientWrapper colors={[colors.white, colors.white]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerLeft} />
            <AppText style={styles.headerTitle}>
              {t('CreateBusiness.addAvailabilityException')}
            </AppText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AppText style={styles.closeButtonText}>✕</AppText>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setAvailable(true)}>
                <RadioButton
                  selected={available === true}
                  onPress={() => setAvailable(true)}
                />
                <AppText style={styles.radioLabel}>
                  {t('CreateBusiness.available')}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setAvailable(false)}>
                <RadioButton
                  selected={available === false}
                  onPress={() => setAvailable(false)}
                />
                <AppText style={styles.radioLabel}>
                  {t('CreateBusiness.notAvailable')}
                </AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <AppText style={styles.label}>
                {t('CreateBusiness.starts')} - {t('CreateBusiness.ends')}
              </AppText>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowCalendar(true)}>
                <AppText
                  style={[
                    styles.dateText,
                    (!startDate || !endDate) && styles.placeholderText,
                  ]}>
                  {startDate && endDate
                    ? formatDateRange(startDate, endDate)
                    : 'Select date range'}
                </AppText>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title={t('CreateBusiness.saveException')}
              onPress={handleSave}
              disabled={!startDate || !endDate}
            />
          </View>
        </View>

        <CalendarPicker
          visible={showCalendar}
          selectedStartDate={startDate}
          selectedEndDate={endDate}
          onClose={() => setShowCalendar(false)}
          onSelectDateRange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
            setShowCalendar(false);
          }}
          disabledDates={disabledDates}
          mode="range"
        />
      </GradientWrapper>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerLeft: {
    width: scale(40),
  },
  headerTitle: {
    fontSize: fontScale(18),
    color: colors.textBlack,
    ...primaryFont('600'),
  },
  closeButton: {
    width: scale(40),
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textBlack,
    borderRadius: scale(20),
  },
  closeButtonText: {
    fontSize: fontScale(18),
    color: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(24),
    paddingTop: scale(24),
  },
  section: {
    marginBottom: scale(24),
  },
  radioOption: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  radioLabel: {
    fontSize: fontScale(16),
    color: colors.textBlack,
    ...primaryFont('400'),
    ...(I18nManager.isRTL ? {marginRight: scale(12)} : {marginLeft: scale(12)}),
  },
  label: {
    fontSize: fontScale(16),
    color: colors.textBlack,
    ...primaryFont('600'),
    marginBottom: scale(8),
  },
  dateInput: {
    backgroundColor: colors.lightGray,
    padding: scale(16),
    borderRadius: scale(8),
  },
  dateText: {
    fontSize: fontScale(16),
    color: colors.textBlack,
    ...primaryFont('400'),
  },
  placeholderText: {
    color: colors.textGray,
  },
  footer: {
    padding: scale(16),
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
});
