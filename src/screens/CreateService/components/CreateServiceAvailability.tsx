import React, {FC, useState} from 'react';
import {I18nManager, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {AppText} from '../../../components';
import {colors, primaryFont} from '../../../constants';
import {scale, fontScale} from '../../../utils';
import {AvailabilityTab} from '../../CreateBusiness/components/AvailabilityTab';
import {EditDefaultScheduleModal} from '../../CreateBusiness/components/EditDefaultScheduleModal';
import {AddExceptionModal} from '../../CreateBusiness/components/AddExceptionModal';

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

interface AvailabilityException {
  id: string;
  startDate: string;
  endDate: string;
  available: boolean;
}

interface CreateServiceAvailabilityProps {
  inProgress: boolean;
  onSubmit: (values: any) => void;
  onChange?: (values: any) => void;
  onValidationChange?: (isValid: boolean) => void;
  initialValues?: {
    weeklySchedule?: WeeklySchedule;
    timezone?: string;
    exceptions?: AvailabilityException[];
  };
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

export const CreateServiceAvailability: FC<CreateServiceAvailabilityProps> = ({
  onChange,
  onValidationChange,
  initialValues,
}) => {
  const {t} = useTranslation();

  const defaultSchedule = daysOfWeek.reduce((acc, day) => {
    acc[day] = {
      enabled: true,
      slots: [{startTime: '09:00', endTime: '17:00', seats: 1}],
    };
    return acc;
  }, {} as WeeklySchedule);

  const [weeklySchedule, setWeeklySchedule] =
    useState<WeeklySchedule>(defaultSchedule);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  // Track if we've initialized from props
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    console.log('📅 Service Availability initialValues:', initialValues);

    if (initialValues && !initialized) {
      console.log(
        '🔄 Setting service availability from initial values (first time)',
      );
      if (initialValues.weeklySchedule) {
        console.log(
          '  - Setting weeklySchedule:',
          initialValues.weeklySchedule,
        );
        setWeeklySchedule(initialValues.weeklySchedule);
      }
      if (initialValues.exceptions) {
        console.log('  - Setting exceptions:', initialValues.exceptions);
        console.log('  - Exceptions count:', initialValues.exceptions.length);
        setExceptions(initialValues.exceptions);
      }
      if (initialValues.timezone) {
        console.log('  - Setting timezone:', initialValues.timezone);
        setTimezone(initialValues.timezone);
      }
      setInitialized(true);
    }
  }, [initialValues, initialized]);

  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [showAddExceptionModal, setShowAddExceptionModal] = useState(false);

  React.useEffect(() => {
    if (onChange) {
      onChange({
        weeklySchedule,
        exceptions,
        timezone,
      });
    }
  }, [weeklySchedule, exceptions, timezone, onChange]);

  // Validate step two - at least one day should be enabled with valid slots
  React.useEffect(() => {
    if (onValidationChange) {
      const hasEnabledDay = Object.values(weeklySchedule).some(
        day => day.enabled && day.slots.length > 0,
      );
      onValidationChange(hasEnabledDay);
    }
  }, [weeklySchedule, onValidationChange]);

  const handleSaveSchedule = (
    schedule: WeeklySchedule,
    newTimezone: string,
  ) => {
    setWeeklySchedule(schedule);
    setTimezone(newTimezone);
  };

  const handleAddException = (exception: {
    startDate: string;
    endDate: string;
    available: boolean;
  }) => {
    try {
      console.log('➕ Adding service exception:', exception);

      if (!exception.startDate || !exception.endDate) {
        console.error('❌ Invalid exception: missing dates');
        return;
      }

      const newException: AvailabilityException = {
        id: Date.now().toString(),
        startDate: exception.startDate,
        endDate: exception.endDate,
        available: exception.available,
      };
      console.log('➕ New service exception with ID:', newException);

      const updatedExceptions = [...exceptions, newException];
      console.log('➕ Updated service exceptions list:', updatedExceptions);
      console.log(
        '➕ Updated service exceptions count:',
        updatedExceptions.length,
      );

      setExceptions(updatedExceptions);
      console.log('✅ Service exception added successfully');
    } catch (error) {
      console.error('❌ Error adding service exception:', error);
    }
  };

  return (
    <View style={styles.container}>
      <AppText style={styles.description}>
        {t('CreateService.availabilityIntro')}
      </AppText>

      <AvailabilityTab
        weeklySchedule={weeklySchedule}
        exceptions={exceptions}
        timezone={timezone}
        onWeeklyScheduleChange={setWeeklySchedule}
        onExceptionsChange={setExceptions}
        onTimezoneChange={setTimezone}
        onEditDefaultSchedule={() => setShowEditScheduleModal(true)}
        onAddException={() => setShowAddExceptionModal(true)}
      />

      <EditDefaultScheduleModal
        visible={showEditScheduleModal}
        schedule={weeklySchedule}
        timezone={timezone}
        onClose={() => setShowEditScheduleModal(false)}
        onSave={handleSaveSchedule}
      />

      <AddExceptionModal
        visible={showAddExceptionModal}
        onClose={() => setShowAddExceptionModal(false)}
        onSave={handleAddException}
        existingExceptions={exceptions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  description: {
    fontSize: fontScale(14),
    color: colors.textBlack,
    ...primaryFont('400'),
    marginBottom: scale(16),
    ...(I18nManager.isRTL && {textAlign: 'left'}),
  },
});
