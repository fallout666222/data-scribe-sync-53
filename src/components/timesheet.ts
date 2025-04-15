
import { fetchTableData, createRecord, updateRecord, deleteRecord, DatabaseRecord, ApiResponse } from '../services/databaseApi';

interface WeekHours extends DatabaseRecord {
  user_id: string;
  week_id: string;
  client_id: string;
  media_type_id: string;
  hours: number;
}

export const getWeekHours = async (userId: string, weekId: string): Promise<ApiResponse<WeekHours[]>> => {
  try {
    const response = await fetchTableData<WeekHours[]>('week_hours');
    if (response.data) {
      const filteredData = response.data.filter(
        item => item.user_id === userId && item.week_id === weekId
      );
      return { data: filteredData, error: null };
    }
    return response;
  } catch (error) {
    console.error('Error fetching week hours:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const updateWeekHours = async (
  userId: string,
  weekId: string,
  clientId: string,
  mediaTypeId: string,
  hours: number
): Promise<ApiResponse<WeekHours | void>> => {
  try {
    // Get all week hours to find existing record
    const { data: allHours } = await fetchTableData<WeekHours[]>('week_hours');
    if (!allHours) {
      return { data: null, error: new Error('Failed to fetch week hours') };
    }
    
    const existingRecord = allHours.find(
      item => 
        item.user_id === userId && 
        item.week_id === weekId &&
        item.client_id === clientId &&
        item.media_type_id === mediaTypeId
    );
    
    if (hours === 0) {
      // Delete the record if hours is 0 and record exists
      if (existingRecord) {
        return await deleteRecord('week_hours', existingRecord.id);
      }
      // If no record exists with 0 hours, nothing to do
      return { data: null, error: null };
    } else if (existingRecord) {
      // Update existing record with non-zero hours
      return await updateRecord<WeekHours>(
        'week_hours',
        existingRecord.id,
        { hours }
      );
    } else {
      // Insert new record with non-zero hours
      return await createRecord<WeekHours>(
        'week_hours',
        {
          user_id: userId,
          week_id: weekId,
          client_id: clientId,
          media_type_id: mediaTypeId,
          hours
        }
      );
    }
  } catch (error) {
    console.error('Error updating week hours:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

// A more generic updateHours function if needed
export const updateHours = updateWeekHours;
