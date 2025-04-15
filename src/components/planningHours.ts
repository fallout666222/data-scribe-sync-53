import { toast } from "@/components/ui/use-toast";

interface PlanningVersion {
  id: string;
  name: string;
  year: string;
  q1_locked: boolean;
  q2_locked: boolean;
  q3_locked: boolean;
  q4_locked: boolean;
  hidden: boolean;
  created_at: string;
}

interface PlanningHours {
  id: string;
  user_id: string;
  version_id: string;
  client_id: string;
  month: string;
  hours: number;
  client?: Client;
}

interface Client {
  id: string;
  name: string;
  // Other client fields
}

const API_BASE_URL = 'http://localhost:5000/api';

export const getPlanningVersions = async (): Promise<PlanningVersion[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/planning_versions?order=created_at.desc`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch planning versions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching planning versions:', error);
    toast({
      title: "Error",
      description: "Failed to fetch planning versions",
      variant: "destructive",
    });
    return [];
  }
};

export const getPlanningHours = async (userId: string, versionId: string): Promise<PlanningHours[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/planning_hours?user_id=eq.${userId}&version_id=eq.${versionId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch planning hours');
    }
    
    // Get client data for each planning hour
    const planningHours = await response.json();
    
    // Get all client IDs from planning hours
    const clientIds = [...new Set(planningHours.map((ph: PlanningHours) => ph.client_id))];
    
    // Fetch all clients in one request
    const clientsResponse = await fetch(`${API_BASE_URL}/tables/clients?id=in.(${clientIds.join(',')})`);
    if (!clientsResponse.ok) {
      throw new Error('Failed to fetch clients for planning hours');
    }
    const clients = await clientsResponse.json();
    
    // Attach client data to each planning hour
    return planningHours.map((ph: PlanningHours) => ({
      ...ph,
      client: clients.find((c: Client) => c.id === ph.client_id)
    }));
  } catch (error) {
    console.error('Error fetching planning hours:', error);
    toast({
      title: "Error",
      description: "Failed to fetch planning hours",
      variant: "destructive",
    });
    return [];
  }
};

export const updatePlanningHours = async (
  userId: string,
  versionId: string,
  clientId: string,
  month: string,
  hours: number
): Promise<PlanningHours | null> => {
  try {
    // Check if hours entry already exists
    const checkResponse = await fetch(
      `${API_BASE_URL}/tables/planning_hours?user_id=eq.${userId}&version_id=eq.${versionId}&client_id=eq.${clientId}&month=eq.${month}`
    );
    
    if (!checkResponse.ok) {
      throw new Error('Failed to check existing planning hours');
    }
    
    const existingEntries = await checkResponse.json();
    const existingEntry = existingEntries.length > 0 ? existingEntries[0] : null;
    
    if (hours === 0) {
      // Delete the record if hours is 0
      if (existingEntry) {
        console.log(`Deleting planning hours for version ${versionId}, client ${clientId}, month ${month}`);
        const deleteResponse = await fetch(`${API_BASE_URL}/tables/planning_hours/${existingEntry.id}`, {
          method: 'DELETE',
        });
        
        if (!deleteResponse.ok) {
          throw new Error('Failed to delete planning hours');
        }
      }
      // If no record exists with 0 hours, nothing to do
      return null;
    } else if (existingEntry) {
      // Update existing record with non-zero hours
      const updateResponse = await fetch(`${API_BASE_URL}/tables/planning_hours/${existingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hours }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update planning hours');
      }
      
      // Get the updated record
      const getResponse = await fetch(`${API_BASE_URL}/tables/planning_hours/${existingEntry.id}`);
      return await getResponse.json();
    } else {
      // Insert new record with non-zero hours
      const createResponse = await fetch(`${API_BASE_URL}/tables/planning_hours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          version_id: versionId,
          client_id: clientId,
          month: month,
          hours
        }),
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create planning hours');
      }
      
      return await createResponse.json();
    }
  } catch (error) {
    console.error('Error updating planning hours:', error);
    toast({
      title: "Error",
      description: "Failed to update planning hours",
      variant: "destructive",
    });
    return null;
  }
};
