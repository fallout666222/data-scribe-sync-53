
import { fetchTableData, createRecord, updateRecord, deleteRecord, DatabaseRecord, ApiResponse } from '../services/databaseApi';

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

export const getAllPlanningVersions = async (): Promise<ApiResponse<PlanningVersion[]>> => {
  return await fetchTableData<PlanningVersion[]>('planning_versions');
};

export const createPlanningVersion = async (
  name: string,
  year: string,
  q1_locked: boolean = false,
  q2_locked: boolean = false,
  q3_locked: boolean = false,
  q4_locked: boolean = false,
  hidden: boolean = false
): Promise<ApiResponse<PlanningVersion>> => {
  return await createRecord<PlanningVersion>('planning_versions', {
    name,
    year,
    q1_locked,
    q2_locked,
    q3_locked,
    q4_locked,
    hidden
  });
};

export const updatePlanningVersion = async (
  id: string,
  updates: {
    name?: string;
    year?: string;
    q1_locked?: boolean;
    q2_locked?: boolean;
    q3_locked?: boolean;
    q4_locked?: boolean;
    hidden?: boolean;
  }
): Promise<ApiResponse<PlanningVersion>> => {
  return await updateRecord<PlanningVersion>('planning_versions', id, updates);
};

export const deletePlanningVersion = async (id: string): Promise<ApiResponse<void>> => {
  return await deleteRecord('planning_versions', id);
};

export const fillActualHours = async (versionId: string, year: string): Promise<ApiResponse<any>> => {
  try {
    // This would require a special endpoint in our Express API
    // For now, we'll return an error
    return { 
      data: null, 
      error: new Error('Function fillActualHours not implemented in the new API') 
    };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
};
