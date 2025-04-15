
import { fetchTableData, createRecord, DatabaseRecord } from '../services/databaseApi';

export interface CustomWeek extends DatabaseRecord {
  name: string;
  period_from: string;
  period_to: string;
  required_hours: number;
}

export const getCustomWeeks = async () => {
  try {
    const result = await fetchTableData<CustomWeek[]>('custom_weeks');
    // Sort by period_from if data exists
    if (result.data) {
      result.data.sort((a, b) => {
        const dateA = new Date(a.period_from);
        const dateB = new Date(b.period_from);
        return dateA.getTime() - dateB.getTime();
      });
    }
    return result;
  } catch (error) {
    console.error('Error fetching custom weeks:', error);
    return { data: null, error };
  }
};

export const createCustomWeek = async (week: Omit<CustomWeek, 'id'>) => {
  return await createRecord<CustomWeek>('custom_weeks', week);
};
