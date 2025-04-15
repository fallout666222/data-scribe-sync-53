
import { fetchTableData, createRecord, updateRecord, DatabaseRecord, ApiResponse } from '../services/databaseApi';

export interface CustomWeek extends DatabaseRecord {
  name: string;
  period_from: string;
  period_to: string;
  required_hours: number;
}

export interface WeekStatus extends DatabaseRecord {
  user_id: string;
  week_id: string;
  week_status_id: string;
  created_at?: string;
}

export interface WeekPercentage extends DatabaseRecord {
  user_id: string;
  week_id: string;
  percentage: number;
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

// Week Status Names
export const getWeekStatusNames = async (): Promise<ApiResponse<any[]>> => {
  return await fetchTableData('week_status_names');
};

// Week Statuses
export const getWeekStatuses = async (userId: string): Promise<ApiResponse<WeekStatus[]>> => {
  try {
    const response = await fetchTableData<WeekStatus[]>('week_statuses');
    if (response.data) {
      const userStatuses = response.data.filter(status => status.user_id === userId);
      return { data: userStatuses, error: null };
    }
    return response;
  } catch (error) {
    console.error('Error fetching week statuses:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const getWeekStatusesChronological = async (userId: string): Promise<ApiResponse<WeekStatus[]>> => {
  try {
    const { data: weekStatuses, error } = await getWeekStatuses(userId);
    if (error) throw error;
    
    // Since we can't join tables in this implementation, we'll just sort by ID or created_at
    return {
      data: weekStatuses?.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateA.getTime() - dateB.getTime();
      }),
      error
    };
  } catch (error) {
    console.error('Error fetching chronological week statuses:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const updateWeekStatus = async (
  userId: string, 
  weekId: string, 
  statusId: string
): Promise<ApiResponse<WeekStatus>> => {
  try {
    // Check if status already exists
    const { data: existingStatuses } = await getWeekStatuses(userId);
    const existingStatus = existingStatuses?.find(
      status => status.user_id === userId && status.week_id === weekId
    );
    
    if (existingStatus) {
      return await updateRecord<WeekStatus>(
        'week_statuses', 
        existingStatus.id, 
        { week_status_id: statusId }
      );
    } else {
      return await createRecord<WeekStatus>(
        'week_statuses', 
        { user_id: userId, week_id: weekId, week_status_id: statusId }
      );
    }
  } catch (error) {
    console.error('Error updating week status:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

// Week Percentages
export const getWeekPercentages = async (userId: string): Promise<ApiResponse<WeekPercentage[]>> => {
  try {
    const response = await fetchTableData<WeekPercentage[]>('week_percentages');
    if (response.data) {
      const userPercentages = response.data.filter(percentage => percentage.user_id === userId);
      return { data: userPercentages, error: null };
    }
    return response;
  } catch (error) {
    console.error('Error fetching week percentages:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const updateWeekPercentage = async (
  userId: string, 
  weekId: string, 
  percentage: number
): Promise<ApiResponse<WeekPercentage>> => {
  try {
    // Check if percentage already exists
    const { data: existingPercentages } = await getWeekPercentages(userId);
    const existingPercentage = existingPercentages?.find(
      item => item.user_id === userId && item.week_id === weekId
    );
    
    if (existingPercentage) {
      return await updateRecord<WeekPercentage>(
        'week_percentages', 
        existingPercentage.id, 
        { percentage }
      );
    } else {
      return await createRecord<WeekPercentage>(
        'week_percentages',
        { user_id: userId, week_id: weekId, percentage }
      );
    }
  } catch (error) {
    console.error('Error updating week percentage:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};
