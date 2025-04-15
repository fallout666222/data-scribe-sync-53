
import { fetchTableData, createRecord, updateRecord, deleteRecord, DatabaseRecord, ApiResponse } from '../services/databaseApi';

export interface PlanningHours extends DatabaseRecord {
  user_id: string;
  version_id: string;
  client_id: string;
  month: string;
  hours: number;
}

export interface PlanningVersion extends DatabaseRecord {
  name: string;
  year: string;
  q1_locked: boolean;
  q2_locked: boolean;
  q3_locked: boolean;
  q4_locked: boolean;
  hidden: boolean;
  created_at?: string;
}

export const getPlanningVersions = async (): Promise<ApiResponse<PlanningVersion[]>> => {
  return await fetchTableData<PlanningVersion[]>('planning_versions');
};

export const getPlanningHours = async (userId: string, versionId: string): Promise<ApiResponse<PlanningHours[]>> => {
  try {
    const response = await fetchTableData<PlanningHours[]>('planning_hours');
    if (response.data) {
      const filteredData = response.data.filter(
        item => item.user_id === userId && item.version_id === versionId
      );
      return { data: filteredData, error: null };
    }
    return response;
  } catch (error) {
    console.error('Error fetching planning hours:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const updatePlanningHours = async (
  userId: string,
  versionId: string,
  clientId: string,
  month: string,
  hours: number
): Promise<ApiResponse<PlanningHours>> => {
  try {
    // Get all planning hours to find existing record
    const { data: allHours } = await fetchTableData<PlanningHours[]>('planning_hours');
    if (!allHours) {
      return { data: null, error: new Error('Failed to fetch planning hours') };
    }
    
    const existingRecord = allHours.find(
      item => 
        item.user_id === userId && 
        item.version_id === versionId &&
        item.client_id === clientId &&
        item.month === month
    );
    
    if (hours === 0) {
      // Delete the record if hours is 0 and record exists
      if (existingRecord) {
        await fetch(`http://localhost:5000/api/tables/planning_hours/${existingRecord.id}`, {
          method: 'DELETE',
        });
      }
      // If no record exists with 0 hours, nothing to do
      return { data: null, error: null };
    } else if (existingRecord) {
      // Update existing record with non-zero hours
      return await updateRecord<PlanningHours>(
        'planning_hours',
        existingRecord.id,
        { hours }
      );
    } else {
      // Insert new record with non-zero hours
      return await createRecord<PlanningHours>(
        'planning_hours',
        {
          user_id: userId,
          version_id: versionId,
          client_id: clientId,
          month: month,
          hours
        }
      );
    }
  } catch (error) {
    console.error('Error updating planning hours:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};
