
import { toast } from "@/components/ui/use-toast";

interface VersionStatus {
  id: string;
  user_id: string;
  version_id: string;
  version_status_id: string;
  created_at: string;
  status?: any;
  version?: any;
}

interface User {
  id: string;
  name: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const getVersionStatus = async (userId: string, versionId: string): Promise<VersionStatus | null> => {
  try {
    // Using order=created_at.desc&limit=1 to ensure we only get the latest status entry
    const response = await fetch(
      `${API_BASE_URL}/tables/version_statuses?user_id=eq.${userId}&version_id=eq.${versionId}&order=created_at.desc&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch version status');
    }
    
    const statuses = await response.json();
    
    if (statuses.length === 0) {
      return null;
    }
    
    const status = statuses[0];
    
    // Get the status name
    const statusNameResponse = await fetch(`${API_BASE_URL}/tables/week_status_names/${status.version_status_id}`);
    if (statusNameResponse.ok) {
      const statusName = await statusNameResponse.json();
      status.status = statusName;
    }
    
    return status;
  } catch (error) {
    console.error('Error fetching version status:', error);
    toast({
      title: "Error",
      description: "Failed to fetch version status",
      variant: "destructive",
    });
    return null;
  }
};

export const getVersionStatuses = async (userId: string): Promise<VersionStatus[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/tables/version_statuses?user_id=eq.${userId}&order=created_at.desc`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch version statuses');
    }
    
    const statuses = await response.json();
    
    // Get all version IDs and status IDs from statuses
    const versionIds = [...new Set(statuses.map((s: VersionStatus) => s.version_id))];
    const statusIds = [...new Set(statuses.map((s: VersionStatus) => s.version_status_id))];
    
    // Fetch all versions in one request
    let versions: any[] = [];
    if (versionIds.length > 0) {
      const versionsResponse = await fetch(`${API_BASE_URL}/tables/planning_versions?id=in.(${versionIds.join(',')})`);
      if (versionsResponse.ok) {
        versions = await versionsResponse.json();
      }
    }
    
    // Fetch all status names in one request
    let statusNames: any[] = [];
    if (statusIds.length > 0) {
      const statusNamesResponse = await fetch(`${API_BASE_URL}/tables/week_status_names?id=in.(${statusIds.join(',')})`);
      if (statusNamesResponse.ok) {
        statusNames = await statusNamesResponse.json();
      }
    }
    
    // Attach version and status data to each version status
    return statuses.map((s: VersionStatus) => ({
      ...s,
      version: versions.find(v => v.id === s.version_id),
      status: statusNames.find(n => n.id === s.version_status_id)
    }));
  } catch (error) {
    console.error('Error fetching version statuses:', error);
    toast({
      title: "Error",
      description: "Failed to fetch version statuses",
      variant: "destructive",
    });
    return [];
  }
};

export const updateVersionStatus = async (userId: string, versionId: string, statusId: string): Promise<VersionStatus | null> => {
  try {
    // Check if status already exists
    const checkResponse = await fetch(
      `${API_BASE_URL}/tables/version_statuses?user_id=eq.${userId}&version_id=eq.${versionId}`
    );
    
    if (!checkResponse.ok) {
      throw new Error('Failed to check existing version status');
    }
    
    const existingEntries = await checkResponse.json();
    const existingEntry = existingEntries.length > 0 ? existingEntries[0] : null;
    
    if (existingEntry) {
      const updateResponse = await fetch(`${API_BASE_URL}/tables/version_statuses/${existingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ version_status_id: statusId }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update version status');
      }
      
      // Get the updated record
      const getResponse = await fetch(`${API_BASE_URL}/tables/version_statuses/${existingEntry.id}`);
      return await getResponse.json();
    } else {
      const createResponse = await fetch(`${API_BASE_URL}/tables/version_statuses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, version_id: versionId, version_status_id: statusId }),
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create version status');
      }
      
      return await createResponse.json();
    }
  } catch (error) {
    console.error('Error updating version status:', error);
    toast({
      title: "Error",
      description: "Failed to update version status",
      variant: "destructive",
    });
    return null;
  }
};

export const getUserVersionsForApproval = async (headId: string): Promise<VersionStatus[]> => {
  try {
    // Get all users where this person is head
    const usersResponse = await fetch(`${API_BASE_URL}/tables/users?user_head_id=eq.${headId}`);
    
    if (!usersResponse.ok) {
      throw new Error('Failed to fetch users for approval');
    }
    
    const users = await usersResponse.json();
    
    if (users.length === 0) {
      return [];
    }
    
    const userIds = users.map((user: User) => user.id);
    
    // Get version statuses for these users
    const statusesResponse = await fetch(
      `${API_BASE_URL}/tables/version_statuses?user_id=in.(${userIds.join(',')})&order=created_at.desc`
    );
    
    if (!statusesResponse.ok) {
      throw new Error('Failed to fetch version statuses for approval');
    }
    
    const statuses = await statusesResponse.json();
    
    // Get all version IDs, status IDs, and user IDs from statuses
    const versionIds = [...new Set(statuses.map((s: VersionStatus) => s.version_id))];
    const statusIds = [...new Set(statuses.map((s: VersionStatus) => s.version_status_id))];
    const statusUserIds = [...new Set(statuses.map((s: VersionStatus) => s.user_id))];
    
    // Fetch all versions in one request
    let versions: any[] = [];
    if (versionIds.length > 0) {
      const versionsResponse = await fetch(`${API_BASE_URL}/tables/planning_versions?id=in.(${versionIds.join(',')})`);
      if (versionsResponse.ok) {
        versions = await versionsResponse.json();
      }
    }
    
    // Fetch all status names in one request
    let statusNames: any[] = [];
    if (statusIds.length > 0) {
      const statusNamesResponse = await fetch(`${API_BASE_URL}/tables/week_status_names?id=in.(${statusIds.join(',')})`);
      if (statusNamesResponse.ok) {
        statusNames = await statusNamesResponse.json();
      }
    }
    
    // Fetch user details for all users
    let userDetails: any[] = [];
    if (statusUserIds.length > 0) {
      const userDetailsResponse = await fetch(`${API_BASE_URL}/tables/users?id=in.(${statusUserIds.join(',')})`);
      if (userDetailsResponse.ok) {
        userDetails = await userDetailsResponse.json();
      }
    }
    
    // Attach version, status, and user data to each version status
    return statuses.map((s: VersionStatus) => ({
      ...s,
      version: versions.find(v => v.id === s.version_id),
      status: statusNames.find(n => n.id === s.version_status_id),
      user: userDetails.find(u => u.id === s.user_id)
    }));
  } catch (error) {
    console.error('Error fetching user versions for approval:', error);
    toast({
      title: "Error",
      description: "Failed to fetch versions for approval",
      variant: "destructive",
    });
    return [];
  }
};
