
import { getMediaTypes, createMediaType } from '../services/databaseApi';

/**
 * Re-exports the database API functions for media types to maintain compatibility
 * with the existing codebase.
 */
export { getMediaTypes, createMediaType };
export type { MediaType } from '../services/databaseApi';
