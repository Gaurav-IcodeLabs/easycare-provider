import React, {FC, useState} from 'react';
import {StyleSheet, View, Modal, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Calendar} from 'react-native-calendars';
import {AppText, Button} from '../../../components';
import {colors} from '../../../constants';
import {scale, fontScale} from '../../../utils';

interface CalendarPickerProps {
  visible: boolean;
  selectedDate?: string;
  selectedStartDate?: string;
  selectedEndDate?: string;
  onClose: () => void;
  onSelectDate?: (date: string) => void;
  onSelectDateRange?: (startDate: string, endDate: string) => void;
  disabledDates?: string[];
  mode?: 'single' | 'range';
}

export const CalendarPicker: FC<CalendarPickerProps> = ({
  visible,
  selectedDate,
  selectedStartDate,
  selectedEndDate,
  onClose,
  onSelectDate,
  onSelectDateRange,
  disabledDates = [],
  mode = 'single',
}) => {
  const {t} = useTranslation();
  const [tempSelectedDate, setTempSelectedDate] = useState(selectedDate || '');
  const [tempStartDate, setTempStartDate] = useState(selectedStartDate || '');
  const [tempEndDate, setTempEndDate] = useState(selectedEndDate || '');

  // Reset temp dates when modal opens
  React.useEffect(() => {
    if (visible) {
      if (mode === 'single') {
        setTempSelectedDate(selectedDate || '');
      } else {
        setTempStartDate(selectedStartDate || '');
        setTempEndDate(selectedEndDate || '');
      }
    }
  }, [visible, selectedDate, selectedStartDate, selectedEndDate, mode]);

  const handleDayPress = (day: any) => {
    // Check if date is disabled
    if (disabledDates.includes(day.dateString)) {
      console.log('📅 Date is disabled:', day.dateString);
      return;
    }

    if (mode === 'single') {
      console.log('📅 Date selected:', day.dateString);
      setTempSelectedDate(day.dateString);
    } else {
      // Range mode
      if (!tempStartDate || (tempStartDate && tempEndDate)) {
        // Start new range
        console.log('📅 Start date selected:', day.dateString);
        setTempStartDate(day.dateString);
        setTempEndDate('');
      } else {
        // Set end date
        const start = new Date(tempStartDate);
        const end = new Date(day.dateString);

        if (end < start) {
          // If end is before start, swap them
          console.log('📅 End date before start, swapping');
          setTempStartDate(day.dateString);
          setTempEndDate(tempStartDate);
        } else {
          console.log('📅 End date selected:', day.dateString);
          setTempEndDate(day.dateString);
        }
      }
    }
  };

  const handleSubmit = () => {
    if (mode === 'single') {
      console.log('📅 Submitting date:', tempSelectedDate);
      if (tempSelectedDate && onSelectDate) {
        onSelectDate(tempSelectedDate);
      }
    } else {
      console.log('📅 Submitting date range:', tempStartDate, '-', tempEndDate);
      if (tempStartDate && tempEndDate && onSelectDateRange) {
        onSelectDateRange(tempStartDate, tempEndDate);
      }
    }
  };

  // Build marked dates object
  const markedDates: any = {};

  if (mode === 'single') {
    // Mark selected date
    if (tempSelectedDate) {
      markedDates[tempSelectedDate] = {
        selected: true,
        selectedColor: colors.primary,
      };
    }
  } else {
    // Mark date range
    if (tempStartDate) {
      markedDates[tempStartDate] = {
        startingDay: true,
        color: colors.primary,
        textColor: colors.white,
      };
    }

    if (tempEndDate) {
      markedDates[tempEndDate] = {
        endingDay: true,
        color: colors.primary,
        textColor: colors.white,
      };

      // Mark all dates in between
      if (tempStartDate) {
        const start = new Date(tempStartDate);
        const end = new Date(tempEndDate);
        const current = new Date(start);
        current.setDate(current.getDate() + 1);

        while (current < end) {
          const dateStr = current.toISOString().split('T')[0];
          markedDates[dateStr] = {
            color: colors.primary + '40', // 40 = 25% opacity
            textColor: colors.textBlack,
          };
          current.setDate(current.getDate() + 1);
        }
      }
    }
  }

  // Mark disabled dates
  disabledDates.forEach(date => {
    if (markedDates[date]) {
      // If already selected, keep selection but mark as disabled
      markedDates[date] = {
        ...markedDates[date],
        disabled: true,
        disableTouchEvent: true,
      };
    } else {
      markedDates[date] = {
        disabled: true,
        disableTouchEvent: true,
        textColor: colors.lightGray,
      };
    }
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AppText style={styles.closeButtonText}>✕</AppText>
            </TouchableOpacity>
          </View>

          <Calendar
            current={
              mode === 'single'
                ? tempSelectedDate || undefined
                : tempStartDate || undefined
            }
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType={mode === 'range' ? 'period' : 'simple'}
            theme={{
              backgroundColor: colors.white,
              calendarBackground: colors.white,
              textSectionTitleColor: colors.textGray,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.white,
              todayTextColor: colors.primary,
              dayTextColor: colors.textBlack,
              textDisabledColor: colors.lightGray,
              monthTextColor: colors.textBlack,
              textMonthFontWeight: '600',
              textDayFontSize: fontScale(16),
              textMonthFontSize: fontScale(18),
              textDayHeaderFontSize: fontScale(12),
            }}
            style={styles.calendar}
          />

          <View style={styles.footer}>
            <Button
              title={t('CreateBusiness.submit')}
              onPress={handleSubmit}
              disabled={
                mode === 'single'
                  ? !tempSelectedDate
                  : !tempStartDate || !tempEndDate
              }
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: scale(12),
    padding: scale(16),
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: scale(16),
  },
  closeButton: {
    width: scale(32),
    height: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textBlack,
    borderRadius: scale(16),
  },
  closeButtonText: {
    fontSize: fontScale(18),
    color: colors.white,
  },
  calendar: {
    marginBottom: scale(16),
  },
  footer: {
    marginTop: scale(8),
  },
});
