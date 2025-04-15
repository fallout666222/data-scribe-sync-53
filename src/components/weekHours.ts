
import { fetchTableData, ApiResponse } from '../services/databaseApi';

// Cache for week hours data
const weekHoursCache: Record<string, any> = {};
// NEW: Add a separate cache for percentages data to prevent duplicate API calls
const weekPercentagesCache: Record<string, any> = {};

// Re-export functions from timesheet.ts to avoid duplicate implementation
export { getWeekHours, updateWeekHours, updateHours } from './timesheet';

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
  const { getWeekPercentages } = await import('./week');
  
  // Fetch data from database if not in cache
  const result = await getWeekPercentages(userId);
  
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
