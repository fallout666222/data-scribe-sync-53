
import { supabase } from '../client';

// Cache for week hours data
const weekHoursCache: Record<string, any> = {};
// NEW: Add a separate cache for percentages data to prevent duplicate API calls
const weekPercentagesCache: Record<string, any> = {};

export const getWeekHours = async (userId: string, weekId: string) => {
  // Generate a cache key based on userId and weekId
  const cacheKey = `${userId}-${weekId}`;
  
  // Return cached data if available
  if (weekHoursCache[cacheKey]) {
    return weekHoursCache[cacheKey];
  }
  
  // Fetch data from Supabase if not in cache
  const result = await supabase.from('week_hours').select(`
    *,
    client:clients(*),
    media_type:media_types(*)
  `).eq('user_id', userId).eq('week_id', weekId);
  
  // Store result in cache
  weekHoursCache[cacheKey] = result;
  
  return result;
};

export const updateWeekHours = async (
  userId: string, 
  weekId: string, 
  clientId: string, 
  mediaTypeId: string, 
  hours: number
) => {
  // Check if hours entry already exists
  const { data } = await supabase.from('week_hours')
    .select('*')
    .eq('user_id', userId)
    .eq('week_id', weekId)
    .eq('client_id', clientId)
    .eq('media_type_id', mediaTypeId)
    .maybeSingle();
  
  // Invalidate cache for this week
  const cacheKey = `${userId}-${weekId}`;
  delete weekHoursCache[cacheKey];
  
  if (hours === 0) {
    // Delete the record if hours is 0
    if (data) {
      return await supabase.from('week_hours')
        .delete()
        .eq('id', data.id);
    }
    // If no record exists with 0 hours, nothing to do
    return { data: null };
  } else if (data) {
    // Update existing record with non-zero hours
    return await supabase.from('week_hours')
      .update({ hours })
      .eq('id', data.id)
      .select()
      .single();
  } else {
    // Insert new record with non-zero hours
    return await supabase.from('week_hours')
      .insert({ user_id: userId, week_id: weekId, client_id: clientId, media_type_id: mediaTypeId, hours })
      .select()
      .single();
  }
};

// Optimized function to handle zero hours by deleting records
export const updateHours = async (userId: string, weekId: string, clientName: string, mediaTypeName: string, hours: number) => {
  try {
    // Get the client and media type IDs from their names
    const { getClients } = await import('./client');
    const { getMediaTypes } = await import('./mediaType');
    
    const { data: clientsData } = await getClients();
    const { data: mediaTypesData } = await getMediaTypes();
    
    const clientObj = clientsData?.find(c => c.name === clientName);
    const mediaTypeObj = mediaTypesData?.find(m => m.name === mediaTypeName);
    
    if (!clientObj || !mediaTypeObj) {
      throw new Error('Client or media type not found');
    }
    
    // Invalidate cache before update
    const cacheKey = `${userId}-${weekId}`;
    delete weekHoursCache[cacheKey];
    
    // Use the existing updateWeekHours function with the IDs
    return await updateWeekHours(userId, weekId, clientObj.id, mediaTypeObj.id, hours);
  } catch (error) {
    throw error;
  }
};

// Clear cache function for use when needed
export const clearWeekHoursCache = (userId?: string, weekId?: string) => {
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

// NEW: Add getWeekPercentages wrapper with caching
export const getWeekPercentagesWithCache = async (userId: string) => {
  // Generate a cache key based on userId
  const cacheKey = `percentages-${userId}`;
  
  // Return cached data if available
  if (weekPercentagesCache[cacheKey]) {
    return weekPercentagesCache[cacheKey];
  }
  
  // Import the original function (can't modify it directly as it's in another file)
  const { getWeekPercentages: originalGetWeekPercentages } = await import('./week');
  
  // Fetch data from Supabase if not in cache
  const result = await originalGetWeekPercentages(userId);
  
  // Store result in cache
  weekPercentagesCache[cacheKey] = result;
  
  return result;
};

// NEW: Method to clear percentages cache
export const clearWeekPercentagesCache = (userId?: string) => {
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
