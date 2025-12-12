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
import {CheckBoxStandalone} from '../../../components/CheckBox/CheckBoxStandalone';
import {colors, primaryFont} from '../../../constants';
import {scale, fontScale, formatTime12Hour} from '../../../utils';
import {TimePickerModal} from './TimePickerModal';

interface TimeSlot {
  startTime: string;
  endTime: string;
  seats: number;
}

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

interface WeeklySchedule {
  [key: string]: DaySchedule;
}

interface EditDefaultScheduleModalProps {
  visible: boolean;
  schedule: WeeklySchedule;
  timezone: string;
  onClose: () => void;
  onSave: (schedule: WeeklySchedule, timezone: string) => void;
}

const daysOfWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const timezones = [
  'Asia/Kolkata',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Dubai',
  'Asia/Tokyo',
];

export const EditDefaultScheduleModal: FC<EditDefaultScheduleModalProps> = ({
  visible,
  schedule,
  timezone,
  onClose,
  onSave,
}) => {
  const {t} = useTranslation();
  const [localSchedule, setLocalSchedule] = useState(schedule);
  const [localTimezone, setLocalTimezone] = useState(timezone);
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerConfig, setTimePickerConfig] = useState<{
    day: string;
    index: number;
    field: 'startTime' | 'endTime';
  } | null>(null);
  // Sync local state with props when modal opens or schedule changes
  React.useEffect(() => {
    if (visible) {
      console.log(
        '📅 EditDefaultScheduleModal: Syncing with schedule:',
        schedule,
      );
      setLocalSchedule(schedule);
      setLocalTimezone(timezone);
    }
  }, [visible, schedule, timezone]);

  const toggleDay = (day: string) => {
    setLocalSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      },
    }));
  };

  const addTimeSlot = (day: string) => {
    // Find the last slot's end time to suggest a non-overlapping start time
    const existingSlots = localSchedule[day].slots;
    let defaultStart = '09:00';
    let defaultEnd = '10:00';

    if (existingSlots.length > 0) {
      const lastSlot = existingSlots[existingSlots.length - 1];
      defaultStart = lastSlot.endTime;
      // Add 1 hour to end time
      const [hours, minutes] = lastSlot.endTime.split(':').map(Number);
      const newHours = (hours + 1) % 24;
      defaultEnd = `${newHours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;
    }

    setLocalSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [
          ...prev[day].slots,
          {startTime: defaultStart, endTime: defaultEnd, seats: 1},
        ],
      },
    }));
  };

  const updateTimeSlot = (
    day: string,
    index: number,
    field: 'startTime' | 'endTime' | 'seats',
    value: string | number,
  ) => {
    setLocalSchedule(prev => {
      const newSlots = [...prev[day].slots];
      newSlots[index] = {...newSlots[index], [field]: value};

      // Validate that end time is after start time
      if (field === 'startTime' || field === 'endTime') {
        const slot = newSlots[index];
        const [startHours, startMinutes] = slot.startTime
          .split(':')
          .map(Number);
        const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
        const startMinutesTotal = startHours * 60 + startMinutes;
        const endMinutesTotal = endHours * 60 + endMinutes;

        if (endMinutesTotal <= startMinutesTotal) {
          // Auto-adjust end time to be 1 hour after start time
          if (field === 'startTime') {
            const newEndHours = (startHours + 1) % 24;
            newSlots[index].endTime = `${newEndHours
              .toString()
              .padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
          }
        }
      }

      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: newSlots,
        },
      };
    });
  };

  const removeTimeSlot = (day: string, index: number) => {
    setLocalSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index),
      },
    }));
  };

  const openTimePicker = (
    day: string,
    index: number,
    field: 'startTime' | 'endTime',
  ) => {
    setTimePickerConfig({day, index, field});
    setShowTimePicker(true);
  };

  const handleTimeSelect = (time: string) => {
    if (timePickerConfig) {
      updateTimeSlot(
        timePickerConfig.day,
        timePickerConfig.index,
        timePickerConfig.field,
        time,
      );
    }
  };

  const validateSchedule = (): {valid: boolean; message?: string} => {
    // Check for overlapping time slots in each day
    for (const day of daysOfWeek) {
      if (!localSchedule[day]?.enabled) {
        continue;
      }

      const slots = localSchedule[day].slots;
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const slot1 = slots[i];
          const slot2 = slots[j];

          const [start1Hours, start1Minutes] = slot1.startTime
            .split(':')
            .map(Number);
          const [end1Hours, end1Minutes] = slot1.endTime.split(':').map(Number);
          const [start2Hours, start2Minutes] = slot2.startTime
            .split(':')
            .map(Number);
          const [end2Hours, end2Minutes] = slot2.endTime.split(':').map(Number);

          const start1 = start1Hours * 60 + start1Minutes;
          const end1 = end1Hours * 60 + end1Minutes;
          const start2 = start2Hours * 60 + start2Minutes;
          const end2 = end2Hours * 60 + end2Minutes;

          // Check if slots overlap
          if (start1 < end2 && end1 > start2) {
            return {
              valid: false,
              message: `${t(`CreateBusiness.days.${day}`)}: ${t(
                'CreateBusiness.overlappingSlots',
              )}`,
            };
          }
        }
      }
    }

    return {valid: true};
  };

  const handleSave = () => {
    const validation = validateSchedule();
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    onSave(localSchedule, localTimezone);
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
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AppText style={styles.closeButtonText}>✕</AppText>
            </TouchableOpacity>
            <AppText style={styles.headerTitle}>
              {t('CreateBusiness.editDefaultScheduleTitle')}
            </AppText>
            <View style={styles.closeButton} />
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>
                {t('CreateBusiness.selectTimezone')}
              </AppText>
              <TouchableOpacity
                style={styles.timezoneSelector}
                onPress={() => setShowTimezoneDropdown(!showTimezoneDropdown)}>
                <AppText style={styles.timezoneText}>{localTimezone}</AppText>
                <AppText style={styles.dropdownIcon}>▼</AppText>
              </TouchableOpacity>

              {showTimezoneDropdown && (
                <View style={styles.timezoneDropdown}>
                  {timezones.map(tz => (
                    <TouchableOpacity
                      key={tz}
                      style={styles.timezoneOption}
                      onPress={() => {
                        setLocalTimezone(tz);
                        setShowTimezoneDropdown(false);
                      }}>
                      <AppText style={styles.timezoneOptionText}>{tz}</AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>
                {t('CreateBusiness.weeklyDefaultSchedule')}
              </AppText>

              {daysOfWeek.map(day => (
                <View key={day} style={styles.daySection}>
                  <TouchableOpacity
                    style={styles.dayRow}
                    onPress={() => toggleDay(day)}>
                    <CheckBoxStandalone
                      checked={localSchedule[day]?.enabled}
                      onPress={() => toggleDay(day)}
                    />
                    <AppText style={styles.dayLabel}>
                      {t(`CreateBusiness.days.${day}`)}
                    </AppText>
                  </TouchableOpacity>

                  {localSchedule[day]?.enabled && (
                    <View style={styles.slotsContainer}>
                      {localSchedule[day].slots.map((slot, index) => (
                        <View key={index} style={styles.slotRow}>
                          <View style={styles.timeInputs}>
                            <View style={styles.timeField}>
                              <AppText style={styles.timeLabel}>
                                {t('CreateBusiness.from')}
                              </AppText>
                              <TouchableOpacity
                                style={styles.timePicker}
                                onPress={() =>
                                  openTimePicker(day, index, 'startTime')
                                }>
                                <AppText style={styles.timeText}>
                                  {formatTime12Hour(slot.startTime)}
                                </AppText>
                              </TouchableOpacity>
                            </View>

                            <View style={styles.timeField}>
                              <AppText style={styles.timeLabel}>
                                {t('CreateBusiness.to')}
                              </AppText>
                              <TouchableOpacity
                                style={styles.timePicker}
                                onPress={() =>
                                  openTimePicker(day, index, 'endTime')
                                }>
                                <AppText style={styles.timeText}>
                                  {formatTime12Hour(slot.endTime)}
                                </AppText>
                              </TouchableOpacity>
                            </View>

                            <View style={styles.seatsField}>
                              <AppText style={styles.timeLabel}>
                                {t('CreateBusiness.seats')}
                              </AppText>
                              <View style={styles.seatsInput}>
                                <TouchableOpacity
                                  onPress={() =>
                                    updateTimeSlot(
                                      day,
                                      index,
                                      'seats',
                                      Math.max(1, slot.seats - 1),
                                    )
                                  }
                                  style={styles.seatsButton}>
                                  <AppText style={styles.seatsButtonText}>
                                    -
                                  </AppText>
                                </TouchableOpacity>
                                <AppText style={styles.seatsValue}>
                                  {slot.seats}
                                </AppText>
                                <TouchableOpacity
                                  onPress={() =>
                                    updateTimeSlot(
                                      day,
                                      index,
                                      'seats',
                                      slot.seats + 1,
                                    )
                                  }
                                  style={styles.seatsButton}>
                                  <AppText style={styles.seatsButtonText}>
                                    +
                                  </AppText>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>

                          {localSchedule[day].slots.length > 1 && (
                            <TouchableOpacity
                              onPress={() => removeTimeSlot(day, index)}
                              style={styles.removeSlotButton}>
                              <AppText style={styles.removeSlotText}>✕</AppText>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}

                      <TouchableOpacity
                        style={styles.addSlotButton}
                        onPress={() => addTimeSlot(day)}>
                        <AppText style={styles.addSlotText}>
                          {t('CreateBusiness.addTimeSlot')}
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title={t('CreateBusiness.saveSchedule')}
              onPress={handleSave}
            />
          </View>
        </View>

        <TimePickerModal
          visible={showTimePicker}
          selectedTime={
            timePickerConfig
              ? localSchedule[timePickerConfig.day].slots[
                  timePickerConfig.index
                ][timePickerConfig.field]
              : '09:00'
          }
          onClose={() => setShowTimePicker(false)}
          onSelectTime={handleTimeSelect}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  closeButton: {
    width: scale(40),
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: fontScale(24),
    color: colors.textBlack,
  },
  headerTitle: {
    fontSize: fontScale(18),
    color: colors.textBlack,
    ...primaryFont('600'),
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(16),
  },
  section: {
    marginTop: scale(24),
  },
  sectionTitle: {
    fontSize: fontScale(16),
    color: colors.textBlack,
    ...primaryFont('600'),
    marginBottom: scale(12),
  },
  timezoneSelector: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.lightGray,
    padding: scale(16),
    borderRadius: scale(8),
  },
  timezoneText: {
    fontSize: fontScale(16),
    color: colors.textBlack,
    ...primaryFont('400'),
  },
  dropdownIcon: {
    fontSize: fontScale(12),
    color: colors.textGray,
  },
  timezoneDropdown: {
    marginTop: scale(8),
    backgroundColor: colors.white,
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  timezoneOption: {
    padding: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  timezoneOptionText: {
    fontSize: fontScale(16),
    color: colors.textBlack,
    ...primaryFont('400'),
  },
  daySection: {
    marginBottom: scale(16),
    paddingBottom: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  dayRow: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingVertical: scale(12),
  },
  dayLabel: {
    fontSize: fontScale(16),
    color: colors.textBlack,
    ...primaryFont('400'),
    ...(I18nManager.isRTL ? {marginRight: scale(12)} : {marginLeft: scale(12)}),
    textTransform: 'capitalize',
  },
  slotsContainer: {
    marginTop: scale(12),
    ...(I18nManager.isRTL ? {marginRight: scale(32)} : {marginLeft: scale(32)}),
  },
  slotRow: {
    marginBottom: scale(12),
  },
  timeInputs: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    gap: scale(8),
    alignItems: 'flex-end',
  },
  timeField: {
    flex: 1,
  },
  seatsField: {
    width: scale(100),
  },
  timeLabel: {
    fontSize: fontScale(12),
    color: colors.textGray,
    ...primaryFont('400'),
    marginBottom: scale(4),
  },
  timePicker: {
    backgroundColor: colors.lightGray,
    padding: scale(12),
    borderRadius: scale(6),
    alignItems: 'center',
  },
  timeText: {
    fontSize: fontScale(14),
    color: colors.textBlack,
    ...primaryFont('400'),
  },
  seatsInput: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: scale(6),
    overflow: 'hidden',
  },
  seatsButton: {
    width: scale(32),
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  seatsButtonText: {
    fontSize: fontScale(18),
    color: colors.white,
    ...primaryFont('600'),
  },
  seatsValue: {
    flex: 1,
    fontSize: fontScale(14),
    color: colors.textBlack,
    ...primaryFont('500'),
    textAlign: 'center',
  },
  removeSlotButton: {
    position: 'absolute',
    top: 0,
    ...(I18nManager.isRTL ? {left: 0} : {right: 0}),
    width: scale(24),
    height: scale(24),
    backgroundColor: colors.error,
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeSlotText: {
    fontSize: fontScale(12),
    color: colors.white,
    ...primaryFont('600'),
  },
  addSlotButton: {
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
    backgroundColor: colors.lightGray,
    borderRadius: scale(6),
    alignItems: 'center',
    marginTop: scale(8),
  },
  addSlotText: {
    fontSize: fontScale(14),
    color: colors.primary,
    ...primaryFont('500'),
  },
  footer: {
    padding: scale(16),
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
});
