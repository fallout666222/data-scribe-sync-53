
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL = 'http://localhost:5000/api';

export interface TableInfo {
  table_name: string;
}

export const fetchTables = async (): Promise<TableInfo[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables`);
    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tables:', error);
    toast({
      title: "Error",
      description: "Failed to fetch database tables",
      variant: "destructive",
    });
    return [];
  }
};

export const fetchTableData = async (tableName: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/${tableName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${tableName}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${tableName}:`, error);
    toast({
      title: "Error",
      description: `Failed to fetch data from ${tableName}`,
      variant: "destructive",
    });
    return [];
  }
};

export const updateRecord = async (tableName: string, id: string | number, data: any): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/${tableName}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update record');
    }
    
    toast({
      title: "Success",
      description: "Record updated successfully",
    });
    
    return true;
  } catch (error) {
    console.error('Error updating record:', error);
    toast({
      title: "Error",
      description: "Failed to update record",
      variant: "destructive",
    });
    return false;
  }
};

export const deleteRecord = async (tableName: string, id: string | number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/${tableName}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete record');
    }
    
    toast({
      title: "Success",
      description: "Record deleted successfully",
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting record:', error);
    toast({
      title: "Error",
      description: "Failed to delete record",
      variant: "destructive",
    });
    return false;
  }
};

export const createRecord = async (tableName: string, data: any): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/${tableName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create record');
    }
    
    toast({
      title: "Success",
      description: "Record created successfully",
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error creating record:', error);
    toast({
      title: "Error",
      description: "Failed to create record",
      variant: "destructive",
    });
    return null;
  }
};
