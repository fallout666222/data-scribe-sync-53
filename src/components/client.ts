
import { toast } from "@/components/ui/use-toast";

interface Client {
  id: string;
  name: string;
  client_id?: string;
  ts_code?: string;
  description?: string;
  parent_id?: string | null;
  agency_id?: string | null;
  hidden?: boolean;
  deletion_mark: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  error: { message: string; details?: string } | null;
}

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetches all active clients from the database.
 * 
 * @returns A promise containing the client data and any error encountered.
 */
export const getClients = async (): Promise<ApiResponse<Client[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/clients?deletion_mark=eq.false`);
    
    if (!response.ok) {
      console.error('API error fetching clients:', response.statusText);
      return { data: null, error: { message: 'Failed to fetch clients' } };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching clients:', error);
    return { 
      data: null, 
      error: error instanceof Error ? 
        { message: error.message, details: 'Unexpected error occurred during client fetch' } : 
        { message: 'Unknown error', details: 'Unknown error occurred during client fetch' } 
    };
  }
};

/**
 * Creates a new client in the database.
 * 
 * @param client - Client data to create. Required fields: name. Optional fields: client_id, ts_code, description, parent_id, agency_id, hidden.
 * @returns A promise containing the created client data and any error encountered.
 */
export const createClient = async (client: { 
  name: string, 
  client_id?: string, 
  ts_code?: string, 
  description?: string, 
  parent_id?: string | null,
  agency_id?: string | null,
  hidden?: boolean
}): Promise<ApiResponse<Client>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(client),
    });

    if (!response.ok) {
      console.error('API error creating client:', response.statusText);
      return { data: null, error: { message: 'Failed to create client' } };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error creating client:', error);
    return {
      data: null,
      error: error instanceof Error ?
        { message: error.message, details: 'Unexpected error occurred while creating client' } :
        { message: 'Unknown error', details: 'Unknown error occurred while creating client' }
    };
  }
};

/**
 * Updates an existing client in the database.
 * 
 * @param id - The UUID of the client to update.
 * @param client - Object containing client properties to update.
 * @returns A promise containing the updated client data and any error encountered.
 */
export const updateClient = async (id: string, client: any): Promise<ApiResponse<Client>> => {
  try {
    // Convert frontend naming conventions to database naming conventions
    if (client.parentId !== undefined) {
      client.parent_id = client.parentId;
      delete client.parentId;
    }
    
    if (client.agencyId !== undefined) {
      client.agency_id = client.agencyId;
      delete client.agencyId;
    }
    
    const response = await fetch(`${API_BASE_URL}/tables/clients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(client),
    });

    if (!response.ok) {
      console.error(`API error updating client with ID ${id}:`, response.statusText);
      return { data: null, error: { message: 'Failed to update client' } };
    }

    const getResponse = await fetch(`${API_BASE_URL}/tables/clients?id=eq.${id}`);
    const updatedData = await getResponse.json();
    
    return { data: updatedData[0], error: null };
  } catch (error) {
    console.error(`Unexpected error updating client with ID ${id}:`, error);
    return {
      data: null,
      error: error instanceof Error ?
        { message: error.message, details: `Unexpected error occurred while updating client with ID ${id}` } :
        { message: 'Unknown error', details: `Unknown error occurred while updating client with ID ${id}` }
    };
  }
};

/**
 * Soft-deletes a client by setting its deletion_mark to true.
 * 
 * @param id - The UUID of the client to delete.
 * @returns A promise containing the result of the operation and any error encountered.
 */
export const deleteClient = async (id: string): Promise<ApiResponse<null>> => {
  try {
    // Perform a soft delete by setting deletion_mark to true
    const response = await fetch(`${API_BASE_URL}/tables/clients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deletion_mark: true }),
    });

    if (!response.ok) {
      console.error(`API error deleting client with ID ${id}:`, response.statusText);
      return { data: null, error: { message: 'Failed to delete client' } };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error(`Unexpected error deleting client with ID ${id}:`, error);
    return {
      data: null,
      error: error instanceof Error ?
        { message: error.message, details: `Unexpected error occurred while deleting client with ID ${id}` } :
        { message: 'Unknown error', details: `Unknown error occurred while deleting client with ID ${id}` }
    };
  }
};
