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

export const CreateServiceAvailability: FC<CreateServiceAvailabilityProps> = ({
  onChange,
  onValidationChange,
  initialValues,
}) => {
  const {t} = useTranslation();

  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(
    initialValues?.weeklySchedule || {},
  );
  const [exceptions, setExceptions] = useState<AvailabilityException[]>(
    initialValues?.exceptions || [],
  );
  const [timezone, setTimezone] = useState<string>(
    initialValues?.timezone || 'Asia/Riyadh',
  );

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
    if (!exception.startDate || !exception.endDate) {
      return;
    }

    const newException: AvailabilityException = {
      id: Date.now().toString(),
      startDate: exception.startDate,
      endDate: exception.endDate,
      available: exception.available,
    };

    setExceptions([...exceptions, newException]);
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
