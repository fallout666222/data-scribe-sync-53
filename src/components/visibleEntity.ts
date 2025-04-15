
import { toast } from "@/components/ui/use-toast";

interface VisibleClient {
  id: string;
  user_id: string;
  client_id: string;
  display_order: number;
}

interface VisibleType {
  id: string;
  user_id: string;
  type_id: string;
  display_order: number;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const getVisibleClients = async (userId: string): Promise<VisibleClient[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/visible_clients?user_id=eq.${userId}&order=display_order.asc`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch visible clients');
    }
    
    const visibleClients = await response.json();
    return visibleClients;
  } catch (error) {
    console.error('Error fetching visible clients:', error);
    toast({
      title: "Error",
      description: "Failed to fetch visible clients",
      variant: "destructive",
    });
    return [];
  }
};

export const updateVisibleClient = async (
  userId: string,
  clientId: string,
  displayOrder: number
): Promise<VisibleClient | null> => {
  try {
    // Check if visible client already exists
    const checkResponse = await fetch(
      `${API_BASE_URL}/tables/visible_clients?user_id=eq.${userId}&client_id=eq.${clientId}`
    );
    
    if (!checkResponse.ok) {
      throw new Error('Failed to check existing visible client');
    }
    
    const existingEntries = await checkResponse.json();
    const existingEntry = existingEntries.length > 0 ? existingEntries[0] : null;
    
    if (existingEntry) {
      const updateResponse = await fetch(`${API_BASE_URL}/tables/visible_clients/${existingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ display_order: displayOrder }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update visible client');
      }
      
      // Get the updated record
      const getResponse = await fetch(`${API_BASE_URL}/tables/visible_clients/${existingEntry.id}`);
      return await getResponse.json();
    } else {
      const createResponse = await fetch(`${API_BASE_URL}/tables/visible_clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, client_id: clientId, display_order: displayOrder }),
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create visible client');
      }
      
      return await createResponse.json();
    }
  } catch (error) {
    console.error('Error updating visible client:', error);
    toast({
      title: "Error",
      description: "Failed to update visible client",
      variant: "destructive",
    });
    return null;
  }
};

export const getVisibleTypes = async (userId: string): Promise<VisibleType[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/visible_types?user_id=eq.${userId}&order=display_order.asc`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch visible types');
    }
    
    const visibleTypes = await response.json();
    return visibleTypes;
  } catch (error) {
    console.error('Error fetching visible types:', error);
    toast({
      title: "Error",
      description: "Failed to fetch visible types",
      variant: "destructive",
    });
    return [];
  }
};

export const updateVisibleType = async (
  userId: string,
  typeId: string,
  displayOrder: number
): Promise<VisibleType | null> => {
  try {
    // Check if visible type already exists
    const checkResponse = await fetch(
      `${API_BASE_URL}/tables/visible_types?user_id=eq.${userId}&type_id=eq.${typeId}`
    );
    
    if (!checkResponse.ok) {
      throw new Error('Failed to check existing visible type');
    }
    
    const existingEntries = await checkResponse.json();
    const existingEntry = existingEntries.length > 0 ? existingEntries[0] : null;
    
    if (existingEntry) {
      const updateResponse = await fetch(`${API_BASE_URL}/tables/visible_types/${existingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ display_order: displayOrder }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update visible type');
      }
      
      // Get the updated record
      const getResponse = await fetch(`${API_BASE_URL}/tables/visible_types/${existingEntry.id}`);
      return await getResponse.json();
    } else {
      const createResponse = await fetch(`${API_BASE_URL}/tables/visible_types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, type_id: typeId, display_order: displayOrder }),
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create visible type');
      }
      
      return await createResponse.json();
    }
  } catch (error) {
    console.error('Error updating visible type:', error);
    toast({
      title: "Error",
      description: "Failed to update visible type",
      variant: "destructive",
    });
    return null;
  }
};
