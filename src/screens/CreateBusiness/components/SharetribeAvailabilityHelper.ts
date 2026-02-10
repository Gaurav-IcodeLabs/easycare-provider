/**
 * Helper functions to convert between our UI format and Sharetribe's availability plan format
 */

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

/**
 * Convert time string to minutes for comparison
 */
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Check if two time slots overlap
 */
const slotsOverlap = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  const start1 = timeToMinutes(slot1.startTime);
  const end1 = timeToMinutes(slot1.endTime);
  const start2 = timeToMinutes(slot2.startTime);
  const end2 = timeToMinutes(slot2.endTime);

  return start1 < end2 && start2 < end1;
};

/**
 * Validate and sort time slots for a day
 */
const validateAndSortSlots = (slots: TimeSlot[]): TimeSlot[] => {
  // Sort by start time
  const sorted = [...slots].sort((a, b) => {
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });

  // Check for overlaps
  for (let i = 0; i < sorted.length - 1; i++) {
    if (slotsOverlap(sorted[i], sorted[i + 1])) {
      console.warn(
        `Overlapping slots detected: ${sorted[i].startTime}-${
          sorted[i].endTime
        } and ${sorted[i + 1].startTime}-${sorted[i + 1].endTime}`,
      );
      // Remove the overlapping slot
      sorted.splice(i + 1, 1);
      i--; // Recheck current position
    }
  }

  return sorted;
};

/**
 * Convert our UI weekly schedule to Sharetribe's availability-plan/time format
 */
export const convertToSharetribeAvailabilityPlan = (
  weeklySchedule: WeeklySchedule,
  timezone: string,
) => {
  const entries: Array<{
    dayOfWeek: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
    seats: number;
    startTime: string;
    endTime: string;
  }> = [];

  const dayMapping: {
    [key: string]: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  } = {
    monday: 'mon',
    tuesday: 'tue',
    wednesday: 'wed',
    thursday: 'thu',
    friday: 'fri',
    saturday: 'sat',
    sunday: 'sun',
  };

  Object.keys(weeklySchedule).forEach(day => {
    const daySchedule = weeklySchedule[day];
    if (daySchedule.enabled && daySchedule.slots.length > 0) {
      // Validate and sort slots to prevent overlaps
      const validSlots = validateAndSortSlots(daySchedule.slots);

      validSlots.forEach(slot => {
        // Ensure end time is after start time
        if (timeToMinutes(slot.endTime) > timeToMinutes(slot.startTime)) {
          entries.push({
            dayOfWeek: dayMapping[day],
            seats: slot.seats,
            startTime: slot.startTime,
            endTime: slot.endTime,
          });
        }
      });
    }
  });

  return {
    type: 'availability-plan/time' as const,
    timezone,
    entries,
  };
};

/**
 * Convert Sharetribe's availability plan back to our UI format
 */
export const convertFromSharetribeAvailabilityPlan = (
  availabilityPlan: any,
): {weeklySchedule: WeeklySchedule; timezone: string} => {
  const dayMapping: {[key: string]: string} = {
    mon: 'monday',
    tue: 'tuesday',
    wed: 'wednesday',
    thu: 'thursday',
    fri: 'friday',
    sat: 'saturday',
    sun: 'sunday',
  };

  const weeklySchedule: WeeklySchedule = {
    monday: {enabled: false, slots: []},
    tuesday: {enabled: false, slots: []},
    wednesday: {enabled: false, slots: []},
    thursday: {enabled: false, slots: []},
    friday: {enabled: false, slots: []},
    saturday: {enabled: false, slots: []},
    sunday: {enabled: false, slots: []},
  };

  if (availabilityPlan?.type === 'availability-plan/time') {
    availabilityPlan.entries.forEach((entry: any) => {
      const day = dayMapping[entry.dayOfWeek];
      if (day) {
        weeklySchedule[day].enabled = true;
        weeklySchedule[day].slots.push({
          startTime: entry.startTime,
          endTime: entry.endTime,
          seats: entry.seats,
        });
      }
    });
  }

  return {
    weeklySchedule,
    timezone: availabilityPlan?.timezone || 'Asia/Riyadh',
  };
};

/**
 * Convert our exception format to Sharetribe's availability exception format
 */
export const convertToSharetribeException = (
  exception: AvailabilityException,
  listingId: string,
) => {
  return {
    listingId,
    start: new Date(exception.startDate),
    end: new Date(exception.endDate),
    seats: exception.available ? 999 : 0, // 0 = not available, high number = available
  };
};

/**
 * Convert Sharetribe's exception back to our format
 */
export const convertFromSharetribeException = (
  exception: any,
): AvailabilityException => {
  return {
    id: exception.id.uuid,
    startDate: new Date(exception.attributes.start).toISOString().split('T')[0],
    endDate: new Date(exception.attributes.end).toISOString().split('T')[0],
    available: exception.attributes.seats > 0,
  };
};
