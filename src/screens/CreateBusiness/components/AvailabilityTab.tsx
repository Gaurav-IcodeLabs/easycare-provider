import React, {FC} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  I18nManager,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {AppText} from '../../../components';
import {colors, primaryFont} from '../../../constants';
import {
  scale,
  fontScale,
  formatDateMedium,
  formatDateShort,
  formatTimeRange,
} from '../../../utils';

interface TimeSlot {
  startTime: string;
  endTime: string;
  seats: number;
}

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

interface AvailabilityException {
  id: string;
  startDate: string;
  endDate: string;
  available: boolean;
}

interface WeeklySchedule {
  [key: string]: DaySchedule;
}

interface AvailabilityTabProps {
  weeklySchedule: WeeklySchedule;
  exceptions: AvailabilityException[];
  timezone: string;
  onWeeklyScheduleChange: (schedule: WeeklySchedule) => void;
  onExceptionsChange: (exceptions: AvailabilityException[]) => void;
  onTimezoneChange: (timezone: string) => void;
  onEditDefaultSchedule: () => void;
  onAddException: () => void;
}

export const AvailabilityTab: FC<AvailabilityTabProps> = ({
  weeklySchedule,
  exceptions,
  onExceptionsChange,
  onEditDefaultSchedule,
  onAddException,
}) => {
  const {t} = useTranslation();

  React.useEffect(() => {
    console.log('🎯 AvailabilityTab received exceptions:', exceptions);
    console.log('🎯 Exceptions count:', exceptions.length);
  }, [exceptions]);

  const getNextWeekDates = () => {
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const nextWeekDates = getNextWeekDates();

  const isDayAvailable = (date: Date) => {
    const dayName = date
      .toLocaleDateString('en-US', {weekday: 'long'})
      .toLowerCase();
    const dateStr = date.toISOString().split('T')[0];

    // Check exceptions first
    const exception = exceptions.find(
      ex => dateStr >= ex.startDate && dateStr <= ex.endDate,
    );

    if (exception) {
      return exception.available;
    }

    // Fall back to weekly schedule
    return weeklySchedule[dayName]?.enabled || false;
  };

  const getDaySlots = (date: Date) => {
    const dayName = date
      .toLocaleDateString('en-US', {weekday: 'long'})
      .toLowerCase();
    return weeklySchedule[dayName]?.slots || [];
  };

  const deleteException = (id: string) => {
    onExceptionsChange(exceptions.filter(ex => ex.id !== id));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        style={styles.editScheduleButton}
        onPress={onEditDefaultSchedule}>
        <AppText style={styles.editScheduleText}>
          {t('CreateBusiness.editDefaultSchedule')}
        </AppText>
      </TouchableOpacity>

      <View style={styles.weekPreview}>
        {nextWeekDates.map((date, index) => {
          const dayName = date
            .toLocaleDateString('en-US', {weekday: 'long'})
            .toLowerCase();
          const isAvailable = isDayAvailable(date);

          return (
            <View key={index} style={styles.dayPreviewCard}>
              <AppText style={styles.dayName}>
                {t(`CreateBusiness.days.${dayName}`)}
              </AppText>
              <AppText style={styles.dayDate}>{formatDateMedium(date)}</AppText>
              {isAvailable ? (
                <View>
                  <View style={styles.availableBadge}>
                    <View style={styles.availableDot} />
                    <AppText style={styles.availableText}>
                      {t('CreateBusiness.available')}
                    </AppText>
                  </View>
                  {getDaySlots(date).map((slot, idx) => (
                    <View key={idx} style={styles.slotInfo}>
                      <AppText style={styles.slotTime}>
                        {formatTimeRange(slot.startTime, slot.endTime)}
                      </AppText>
                      <AppText style={styles.slotSeats}>
                        {slot.seats} {t('CreateBusiness.seatsAvailable')}
                      </AppText>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.unavailableCard} />
              )}
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.addExceptionButton}
        onPress={onAddException}>
        <AppText style={styles.addExceptionText}>
          {t('CreateBusiness.addAvailabilityException')}
        </AppText>
      </TouchableOpacity>

      {exceptions.length > 0 && (
        <View style={styles.exceptionsContainer}>
          {exceptions.map(exception => (
            <View key={exception.id} style={styles.exceptionCard}>
              <View style={styles.exceptionInfo}>
                <View style={styles.exceptionIndicator}>
                  <View
                    style={[
                      styles.exceptionDot,
                      exception.available
                        ? styles.availableDot
                        : styles.unavailableDot,
                    ]}
                  />
                  <AppText style={styles.exceptionStatus}>
                    {exception.available
                      ? t('CreateBusiness.available')
                      : t('CreateBusiness.notAvailable')}
                  </AppText>
                </View>
                <AppText style={styles.exceptionDates}>
                  {exception.startDate === exception.endDate
                    ? formatDateShort(exception.startDate)
                    : `${formatDateShort(
                        exception.startDate,
                      )} - ${formatDateShort(exception.endDate)}`}
                </AppText>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteException(exception.id)}>
                <AppText style={styles.deleteButtonText}>
                  {t('CreateBusiness.delete')}
                </AppText>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  editScheduleButton: {
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    marginBottom: scale(16),
  },
  editScheduleText: {
    fontSize: fontScale(16),
    color: colors.primary,
    ...primaryFont('500'),
  },
  weekPreview: {
    gap: scale(12),
    marginBottom: scale(24),
  },
  dayPreviewCard: {
    backgroundColor: colors.lightGray,
    padding: scale(16),
    borderRadius: scale(8),
  },
  dayName: {
    fontSize: fontScale(16),
    color: colors.textBlack,
    ...primaryFont('600'),
    marginBottom: scale(4),
    textTransform: 'capitalize',
  },
  dayDate: {
    fontSize: fontScale(14),
    color: colors.textGray,
    ...primaryFont('400'),
    marginBottom: scale(12),
  },
  availableBadge: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
  },
  availableDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: colors.primary,
    ...(I18nManager.isRTL ? {marginLeft: scale(8)} : {marginRight: scale(8)}),
  },
  availableText: {
    fontSize: fontScale(14),
    color: colors.textBlack,
    ...primaryFont('400'),
  },
  unavailableCard: {
    height: scale(24),
  },
  slotInfo: {
    marginTop: scale(8),
    paddingLeft: scale(16),
  },
  slotTime: {
    fontSize: fontScale(13),
    color: colors.textBlack,
    ...primaryFont('500'),
  },
  slotSeats: {
    fontSize: fontScale(12),
    color: colors.textGray,
    ...primaryFont('400'),
    marginTop: scale(2),
  },
  addExceptionButton: {
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    marginBottom: scale(16),
  },
  addExceptionText: {
    fontSize: fontScale(16),
    color: colors.primary,
    ...primaryFont('500'),
  },
  exceptionsContainer: {
    gap: scale(12),
  },
  exceptionCard: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.lightGray,
    padding: scale(16),
    borderRadius: scale(8),
  },
  exceptionInfo: {
    flex: 1,
  },
  exceptionIndicator: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    marginBottom: scale(4),
  },
  exceptionDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    ...(I18nManager.isRTL ? {marginLeft: scale(8)} : {marginRight: scale(8)}),
  },
  unavailableDot: {
    backgroundColor: colors.error,
  },
  exceptionStatus: {
    fontSize: fontScale(14),
    color: colors.textBlack,
    ...primaryFont('500'),
  },
  exceptionDates: {
    fontSize: fontScale(14),
    color: colors.textGray,
    ...primaryFont('400'),
  },
  deleteButton: {
    paddingVertical: scale(8),
    paddingHorizontal: scale(16),
    backgroundColor: colors.lightYellow,
    borderRadius: scale(6),
  },
  deleteButtonText: {
    fontSize: fontScale(14),
    color: colors.textBlack,
    ...primaryFont('400'),
  },
  bottomSpacer: {
    height: scale(100),
  },
});
