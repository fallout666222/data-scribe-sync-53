
import { getDepartments, createDepartment, deleteDepartment } from '../services/databaseApi';

/**
 * Re-exports the database API functions for departments to maintain compatibility
 * with the existing codebase.
 */
export { getDepartments, createDepartment, deleteDepartment };
export type { Department } from '../services/databaseApi';
