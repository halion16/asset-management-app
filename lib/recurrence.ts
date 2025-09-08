import { WorkOrder } from '@/data/mockData';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrenceConfig {
  type: RecurrenceType;
  interval: number;
  weeklyDays?: number[];
  monthlyDay?: number;
}

export function calculateNextDueDate(
  currentDate: string, 
  recurrence: RecurrenceConfig
): string | null {
  if (recurrence.type === 'none') {
    return null;
  }

  const current = new Date(currentDate);
  let nextDate = new Date(current);

  switch (recurrence.type) {
    case 'daily':
      nextDate.setDate(current.getDate() + recurrence.interval);
      break;
    case 'weekly':
      if (recurrence.weeklyDays && recurrence.weeklyDays.length > 0) {
        // Find next occurrence on one of the specified days
        nextDate = getNextWeeklyOccurrence(current, recurrence.weeklyDays, recurrence.interval);
      } else {
        // Default to same day of week
        nextDate.setDate(current.getDate() + (recurrence.interval * 7));
      }
      break;
    case 'monthly':
      if (recurrence.monthlyDay) {
        // Set to specific day of month
        nextDate = getNextMonthlyOccurrence(current, recurrence.monthlyDay, recurrence.interval);
      } else {
        // Default to same day of month
        nextDate.setMonth(current.getMonth() + recurrence.interval);
      }
      break;
    case 'yearly':
      nextDate.setFullYear(current.getFullYear() + recurrence.interval);
      break;
    default:
      return null;
  }

  return nextDate.toISOString().split('T')[0];
}

function getNextWeeklyOccurrence(
  currentDate: Date, 
  weeklyDays: number[], 
  interval: number
): Date {
  const currentDay = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const sortedDays = [...weeklyDays].sort();
  
  // Find the next day in this week
  const nextDayThisWeek = sortedDays.find(day => day > currentDay);
  
  if (nextDayThisWeek !== undefined) {
    // Next occurrence is this week
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + (nextDayThisWeek - currentDay));
    return nextDate;
  } else {
    // Next occurrence is in the next interval of weeks
    const firstDay = sortedDays[0];
    const nextDate = new Date(currentDate);
    const daysToAdd = (interval * 7) + (firstDay - currentDay);
    nextDate.setDate(currentDate.getDate() + daysToAdd);
    return nextDate;
  }
}

function getNextMonthlyOccurrence(
  currentDate: Date,
  monthlyDay: number,
  interval: number
): Date {
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  let nextDate = new Date(currentYear, currentMonth, monthlyDay);
  
  // If the target day this month has already passed, or if the day doesn't exist in this month
  if (monthlyDay <= currentDay || nextDate.getDate() !== monthlyDay) {
    // Move to next interval of months
    nextDate = new Date(currentYear, currentMonth + interval, monthlyDay);
    
    // Handle case where target day doesn't exist in target month (e.g., Feb 30)
    // JavaScript automatically adjusts to the nearest valid date
    if (nextDate.getDate() !== monthlyDay) {
      // Move to the last day of the month if the target day doesn't exist
      nextDate = new Date(currentYear, currentMonth + interval + 1, 0);
    }
  }
  
  return nextDate;
}

export function createRecurringWorkOrder(
  originalWorkOrder: WorkOrder,
  nextDueDate: string
): WorkOrder {
  const now = new Date();
  const newId = `${originalWorkOrder.id}-${Date.now()}`;
  const newOrderNumber = `${originalWorkOrder.orderNumber || 'WO'}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

  return {
    ...originalWorkOrder,
    id: newId,
    orderNumber: newOrderNumber,
    status: 'open',
    createdDate: now.toISOString().split('T')[0],
    dueDate: nextDueDate,
    completedDate: undefined,
    actualTime: undefined,
    comments: [],
    parentWorkOrderId: originalWorkOrder.id,
    recurrence: originalWorkOrder.recurrence ? {
      ...originalWorkOrder.recurrence,
      nextDueDate: calculateNextDueDate(nextDueDate, {
        type: originalWorkOrder.recurrence.type,
        interval: originalWorkOrder.recurrence.interval
      })
    } : undefined
  };
}

export function getRecurrenceLabel(type: RecurrenceType): string {
  switch (type) {
    case 'none': return 'Non si ripete';
    case 'daily': return 'Giornaliera';
    case 'weekly': return 'Settimanale';
    case 'monthly': return 'Mensile';
    case 'yearly': return 'Annuale';
    default: return 'Non si ripete';
  }
}

export function shouldCreateNextRecurrence(workOrder: WorkOrder): boolean {
  return !!(
    workOrder.recurrence?.isRecurring &&
    workOrder.recurrence.type !== 'none' &&
    workOrder.status === 'completed'
  );
}