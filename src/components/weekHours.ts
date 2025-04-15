
import { toast } from "@/components/ui/use-toast";

interface WeekHours {
  id: string;
  user_id: string;
  week_id: string;
  client_id: string;
  media_type_id: string;
  hours: number;
}

interface WeekPercentage {
  id: string;
  user_id: string;
  week_id: string;
  percentage: number;
  week?: any;
}

const API_BASE_URL = 'http://localhost:5000/api';

// Cache for week hours data
const weekHoursCache: Record<string, any> = {};
// Add a separate cache for percentages data to prevent duplicate API calls
const weekPercentagesCache: Record<string, any> = {};

export const getWeekHours = async (userId: string, weekId: string): Promise<WeekHours[]> => {
  // Generate a cache key based on userId and weekId
  const cacheKey = `${userId}-${weekId}`;
  
  // Return cached data if available
  if (weekHoursCache[cacheKey]) {
    return weekHoursCache[cacheKey];
  }
  
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
    const result = weekHours.map((wh: WeekHours) => ({
      ...wh,
      client: clients.find((c: any) => c.id === wh.client_id),
      media_type: mediaTypes.find((m: any) => m.id === wh.media_type_id)
    }));
    
    // Store result in cache
    weekHoursCache[cacheKey] = result;
    
    return result;
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
    
    // Invalidate cache for this week
    const cacheKey = `${userId}-${weekId}`;
    delete weekHoursCache[cacheKey];
    
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

// Optimized function to handle zero hours by deleting records
export const updateHours = async (userId: string, weekId: string, clientName: string, mediaTypeName: string, hours: number): Promise<WeekHours | null> => {
  try {
    // Get the client and media type IDs from their names
    const clientsResponse = await fetch(`${API_BASE_URL}/tables/clients?name=eq.${clientName}`);
    const mediaTypesResponse = await fetch(`${API_BASE_URL}/tables/media_types?name=eq.${mediaTypeName}`);
    
    if (!clientsResponse.ok || !mediaTypesResponse.ok) {
      throw new Error('Failed to fetch client or media type');
    }
    
    const clients = await clientsResponse.json();
    const mediaTypes = await mediaTypesResponse.json();
    
    const clientObj = clients.length > 0 ? clients[0] : null;
    const mediaTypeObj = mediaTypes.length > 0 ? mediaTypes[0] : null;
    
    if (!clientObj || !mediaTypeObj) {
      throw new Error('Client or media type not found');
    }
    
    // Invalidate cache before update
    const cacheKey = `${userId}-${weekId}`;
    delete weekHoursCache[cacheKey];
    
    // Use the existing updateWeekHours function with the IDs
    return await updateWeekHours(userId, weekId, clientObj.id, mediaTypeObj.id, hours);
  } catch (error) {
    console.error('Error updating hours:', error);
    toast({
      title: "Error",
      description: "Failed to update hours",
      variant: "destructive",
    });
    return null;
  }
};

// Clear cache function for use when needed
export const clearWeekHoursCache = (userId?: string, weekId?: string): void => {
  if (userId && weekId) {
    delete weekHoursCache[`${userId}-${weekId}`];
  } else if (userId) {
    // Clear all entries for this user
    Object.keys(weekHoursCache).forEach(key => {
      if (key.startsWith(`${userId}-`)) {
        delete weekHoursCache[key];
      }
    });
  } else {
    // Clear all cache
    Object.keys(weekHoursCache).forEach(key => {
      delete weekHoursCache[key];
    });
  }
};

// Add getWeekPercentages wrapper with caching
export const getWeekPercentagesWithCache = async (userId: string): Promise<WeekPercentage[]> => {
  // Generate a cache key based on userId
  const cacheKey = `percentages-${userId}`;
  
  // Return cached data if available
  if (weekPercentagesCache[cacheKey]) {
    return weekPercentagesCache[cacheKey];
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/tables/week_percentages?user_id=eq.${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch week percentages');
    }
    
    const weekPercentages = await response.json();
    
    // Get all week IDs from week percentages
    const weekIds = [...new Set(weekPercentages.map((wp: WeekPercentage) => wp.week_id))];
    
    // Fetch all weeks in one request
    let weeks: any[] = [];
    if (weekIds.length > 0) {
      const weeksResponse = await fetch(`${API_BASE_URL}/tables/custom_weeks?id=in.(${weekIds.join(',')})`);
      if (weeksResponse.ok) {
        weeks = await weeksResponse.json();
      }
    }
    
    // Attach week data to each week percentage
    const result = weekPercentages.map((wp: WeekPercentage) => ({
      ...wp,
      week: weeks.find(w => w.id === wp.week_id)
    }));
    
    // Store result in cache
    weekPercentagesCache[cacheKey] = result;
    
    return result;
  } catch (error) {
    console.error('Error fetching week percentages with cache:', error);
    toast({
      title: "Error",
      description: "Failed to fetch week percentages",
      variant: "destructive",
    });
    return [];
  }
};

// Method to clear percentages cache
export const clearWeekPercentagesCache = (userId?: string): void => {
  if (userId) {
    delete weekPercentagesCache[`percentages-${userId}`];
  } else {
    // Clear all percentages cache
    Object.keys(weekPercentagesCache).forEach(key => {
      delete weekPercentagesCache[key];
    });
  }
};

// Export the original methods so they're still available
export { getWeekPercentages } from './week';
