import React, {FC, useState} from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import {AppText, Button} from '../../../components';
import {colors, primaryFont} from '../../../constants';
import {scale, fontScale} from '../../../utils';

interface TimePickerModalProps {
  visible: boolean;
  selectedTime: string;
  onClose: () => void;
  onSelectTime: (time: string) => void;
}

export const TimePickerModal: FC<TimePickerModalProps> = ({
  visible,
  selectedTime,
  onClose,
  onSelectTime,
}) => {
  const {t} = useTranslation();

  // Convert time string to Date object
  const timeToDate = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  };

  // Convert Date object to time string
  const dateToTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [tempTime, setTempTime] = useState(timeToDate(selectedTime));

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempTime(selectedDate);
    }
  };

  const handleSubmit = () => {
    onSelectTime(dateToTime(tempTime));
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <AppText style={styles.headerTitle}>
              {t('CreateBusiness.selectTime')}
            </AppText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AppText style={styles.closeButtonText}>✕</AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={tempTime}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              minuteInterval={60}
              style={styles.picker}
            />
          </View>

          <View style={styles.footer}>
            <Button title={t('CreateBusiness.submit')} onPress={handleSubmit} />
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
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: scale(16),
    borderTopRightRadius: scale(16),
    paddingBottom: scale(20),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: fontScale(18),
    color: colors.textBlack,
    ...primaryFont('600'),
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
  pickerContainer: {
    paddingVertical: scale(20),
    alignItems: 'center',
  },
  picker: {
    width: '100%',
    height: scale(200),
  },
  footer: {
    paddingHorizontal: scale(16),
    marginTop: scale(8),
  },
});
