
import { fetchTableData, createRecord, updateRecord, DatabaseRecord, ApiResponse } from '../services/databaseApi';

interface VersionStatus extends DatabaseRecord {
  user_id: string;
  version_id: string;
  version_status_id: string;
  created_at?: string;
}

export const getVersionStatus = async (userId: string, versionId: string): Promise<ApiResponse<VersionStatus>> => {
  try {
    const response = await fetchTableData<VersionStatus[]>('version_statuses');
    if (response.data) {
      // Find matching statuses
      const matchingStatuses = response.data.filter(
        status => status.user_id === userId && status.version_id === versionId
      );
      
      if (matchingStatuses.length > 0) {
        // Sort by created_at and get the latest one
        matchingStatuses.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;  // Sort in descending order (latest first)
        });
        
        return { data: matchingStatuses[0], error: null };
      }
    }
    return { data: null, error: null };  // No matching status found
  } catch (error) {
    console.error('Error fetching version status:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const getVersionStatuses = async (userId: string): Promise<ApiResponse<VersionStatus[]>> => {
  try {
    const response = await fetchTableData<VersionStatus[]>('version_statuses');
    if (response.data) {
      const userStatuses = response.data.filter(status => status.user_id === userId);
      return { data: userStatuses, error: null };
    }
    return response;
  } catch (error) {
    console.error('Error fetching version statuses:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const updateVersionStatus = async (
  userId: string, 
  versionId: string, 
  statusId: string
): Promise<ApiResponse<VersionStatus>> => {
  try {
    // Check if status already exists
    const { data: existingStatuses } = await fetchTableData<VersionStatus[]>('version_statuses');
    if (!existingStatuses) {
      return { data: null, error: new Error('Failed to fetch version statuses') };
    }
    
    const existingStatus = existingStatuses.find(
      status => status.user_id === userId && status.version_id === versionId
    );
    
    if (existingStatus) {
      return await updateRecord<VersionStatus>(
        'version_statuses', 
        existingStatus.id, 
        { version_status_id: statusId }
      );
    } else {
      return await createRecord<VersionStatus>(
        'version_statuses', 
        { user_id: userId, version_id: versionId, version_status_id: statusId }
      );
    }
  } catch (error) {
    console.error('Error updating version status:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const getUserVersionsForApproval = async (headId: string): Promise<ApiResponse<any[]>> => {
  try {
    // This would require custom logic and multiple table queries
    // For now, we'll return an empty result
    console.log('getUserVersionsForApproval: Not fully implemented in the new API');
    return { data: [], error: null };
  } catch (error) {
    console.error('Error in getUserVersionsForApproval:', error);
    return { data: [], error: error instanceof Error ? error : new Error('Unknown error') };
  }
};
