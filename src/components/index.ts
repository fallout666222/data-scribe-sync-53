
// Export all database functions from entity modules

// Client operations
export * from './client';

// User operations
export * from './user';

// Department operations
export * from './department';

// Media Type operations
export * from './mediaType';

// Week operations - export everything except the duplicated functions
import * as WeekModule from './week';
export { 
  getWeekStatusNames,
  getWeekStatuses,
  getWeekStatusesChronological,
  updateWeekStatus,
  getWeekPercentages,
  updateWeekPercentage
} from './week';

// Week Hours operations - export everything except the duplicated functions
import * as WeekHoursModule from './weekHours';
export {
  // Re-export only non-duplicate functions from weekHours
  getWeekPercentagesWithCache,
  clearWeekHoursCache,
  clearWeekPercentagesCache
} from './weekHours';

// Visible Entity operations (clients and media types visibility)
export * from './visibleEntity';

// Planning Hours operations - Explicitly export to avoid duplicate PlanningVersion
export { 
  getPlanningHours, 
  updatePlanningHours 
} from './planningHours';

// Planning Versions operations - Make sure we're not re-exporting PlanningVersion twice
export { 
  getAllPlanningVersions,
  createPlanningVersion,
  updatePlanningVersion,
  deletePlanningVersion,
  fillActualHours
} from './planningVersions';

// Version Status operations
export * from './versionStatus';

// Years operations
export * from './years';

// Explicitly re-export the functions that would cause duplicates
// We're choosing the implementations from customWeeks and timesheet over the ones in week and weekHours
export { getCustomWeeks, createCustomWeek } from './customWeeks';
export { getWeekHours, updateWeekHours, updateHours } from './timesheet';

// Re-export needed types 
export type { PlanningVersion } from './planningVersions';
export type { PlanningHours } from './planningHours';
