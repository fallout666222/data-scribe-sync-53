
import { fetchTableData, createRecord, DatabaseRecord, ApiResponse } from '../services/databaseApi';

export interface CustomWeek extends DatabaseRecord {
  name: string;
  period_from: string;
  period_to: string;
  required_hours: number;
}

export const getCustomWeeks = async (): Promise<ApiResponse<CustomWeek[]>> => {
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
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const createCustomWeek = async (week: Omit<CustomWeek, 'id'>): Promise<ApiResponse<CustomWeek>> => {
  return await createRecord<CustomWeek>('custom_weeks', week);
};
