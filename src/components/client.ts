
import { getClients, createClient, updateClient, deleteClient } from '../services/databaseApi';

/**
 * Re-exports the database API functions for clients to maintain compatibility
 * with the existing codebase.
 */
export { getClients, createClient, updateClient, deleteClient };
export type { Client } from '../services/databaseApi';
