import React, {FC} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {AppText, Button} from '../../../components';
import {colors, primaryFont} from '../../../constants';
import {scale, fontScale} from '../../../utils';
import {useTranslation} from 'react-i18next';

interface TimeSlot {
  start: string;
  end: string;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
}

export const TimeSlotPicker: FC<TimeSlotPickerProps> = ({slots, onChange}) => {
  const {t} = useTranslation();

  const addSlot = () => {
    onChange([...slots, {start: '09:00', end: '17:00'}]);
  };

  const removeSlot = (index: number) => {
    const newSlots = slots.filter((_, i) => i !== index);
    onChange(newSlots);
  };

  const updateSlot = (index: number, field: 'start' | 'end', value: string) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    onChange(newSlots);
  };

  return (
    <View style={styles.container}>
      {slots.map((slot, index) => (
        <View key={index} style={styles.slotContainer}>
          <View style={styles.timeInputs}>
            <View style={styles.timeInput}>
              <AppText style={styles.timeLabel}>
                {t('CreateBusiness.from')}
              </AppText>
              <AppText style={styles.timeValue}>{slot.start}</AppText>
            </View>

            <AppText style={styles.timeSeparator}>-</AppText>

            <View style={styles.timeInput}>
              <AppText style={styles.timeLabel}>
                {t('CreateBusiness.to')}
              </AppText>
              <AppText style={styles.timeValue}>{slot.end}</AppText>
            </View>
          </View>

          {slots.length > 1 && (
            <TouchableOpacity
              onPress={() => removeSlot(index)}
              style={styles.removeButton}>
              <AppText style={styles.removeButtonText}>×</AppText>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <TouchableOpacity onPress={addSlot} style={styles.addButton}>
        <AppText style={styles.addButtonText}>
          + {t('CreateBusiness.addTimeSlot')}
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: scale(8),
  },
  slotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(8),
    backgroundColor: colors.white,
    padding: scale(12),
    borderRadius: scale(8),
  },
  timeInputs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: fontScale(12),
    color: colors.textGray,
    ...primaryFont('400'),
    marginBottom: scale(4),
  },
  timeValue: {
    fontSize: fontScale(14),
    color: colors.textBlack,
    ...primaryFont('500'),
  },
  timeSeparator: {
    fontSize: fontScale(16),
    color: colors.textGray,
    marginHorizontal: scale(8),
  },
  removeButton: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: scale(8),
  },
  removeButtonText: {
    fontSize: fontScale(20),
    color: colors.white,
    ...primaryFont('600'),
  },
  addButton: {
    padding: scale(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: scale(8),
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: fontScale(14),
    color: colors.primary,
    ...primaryFont('500'),
  },
});
