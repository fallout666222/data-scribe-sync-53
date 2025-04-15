
import { toast } from "@/components/ui/use-toast";

interface WeekHours {
  id: string;
  user_id: string;
  week_id: string;
  client_id: string;
  media_type_id: string;
  hours: number;
  client?: any;
  media_type?: any;
}

const API_BASE_URL = 'http://localhost:5000/api';

// Week Hours
export const getWeekHours = async (userId: string, weekId: string): Promise<WeekHours[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/week_hours?user_id=eq.${userId}&week_id=eq.${weekId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch week hours');
    }
    
    const weekHours = await response.json();
    
    // Get all client IDs and media_type IDs from week hours
    const clientIds = [...new Set(weekHours.map((wh: WeekHours) => wh.client_id))];
    const mediaTypeIds = [...new Set(weekHours.map((wh: WeekHours) => wh.media_type_id))];
    
    // Fetch all clients in one request
    let clients: any[] = [];
    if (clientIds.length > 0) {
      const clientsResponse = await fetch(`${API_BASE_URL}/tables/clients?id=in.(${clientIds.join(',')})`);
      if (clientsResponse.ok) {
        clients = await clientsResponse.json();
      }
    }
    
    // Fetch all media types in one request
    let mediaTypes: any[] = [];
    if (mediaTypeIds.length > 0) {
      const mediaTypesResponse = await fetch(`${API_BASE_URL}/tables/media_types?id=in.(${mediaTypeIds.join(',')})`);
      if (mediaTypesResponse.ok) {
        mediaTypes = await mediaTypesResponse.json();
      }
    }
    
    // Attach client and media type data to each week hour
    return weekHours.map((wh: WeekHours) => ({
      ...wh,
      client: clients.find(c => c.id === wh.client_id),
      media_type: mediaTypes.find(m => m.id === wh.media_type_id)
    }));
  } catch (error) {
    console.error('Error fetching week hours:', error);
    toast({
      title: "Error",
      description: "Failed to fetch week hours",
      variant: "destructive",
    });
    return [];
  }
};

export const updateWeekHours = async (
  userId: string,
  weekId: string,
  clientId: string,
  mediaTypeId: string,
  hours: number
): Promise<WeekHours | null> => {
  try {
    // Check if hours entry already exists
    const checkResponse = await fetch(
      `${API_BASE_URL}/tables/week_hours?user_id=eq.${userId}&week_id=eq.${weekId}&client_id=eq.${clientId}&media_type_id=eq.${mediaTypeId}`
    );
    
    if (!checkResponse.ok) {
      throw new Error('Failed to check existing week hours');
    }
    
    const existingEntries = await checkResponse.json();
    const existingEntry = existingEntries.length > 0 ? existingEntries[0] : null;
    
    if (hours === 0) {
      // Delete the record if hours is 0
      if (existingEntry) {
        const deleteResponse = await fetch(`${API_BASE_URL}/tables/week_hours/${existingEntry.id}`, {
          method: 'DELETE',
        });
        
        if (!deleteResponse.ok) {
          throw new Error('Failed to delete week hours');
        }
      }
      // If no record exists with 0 hours, nothing to do
      return null;
    } else if (existingEntry) {
      // Update existing record with non-zero hours
      const updateResponse = await fetch(`${API_BASE_URL}/tables/week_hours/${existingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hours }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update week hours');
      }
      
      // Get the updated record
      const getResponse = await fetch(`${API_BASE_URL}/tables/week_hours/${existingEntry.id}`);
      return await getResponse.json();
    } else {
      // Insert new record with non-zero hours
      const createResponse = await fetch(`${API_BASE_URL}/tables/week_hours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          week_id: weekId,
          client_id: clientId,
          media_type_id: mediaTypeId,
          hours
        }),
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create week hours');
      }
      
      return await createResponse.json();
    }
  } catch (error) {
    console.error('Error updating week hours:', error);
    toast({
      title: "Error",
      description: "Failed to update week hours",
      variant: "destructive",
    });
    return null;
  }
};

// A more generic updateHours function if needed
export const updateHours = updateWeekHours;
