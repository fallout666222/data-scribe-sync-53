
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL = 'http://localhost:5000/api';

// Базовые типы
export interface DatabaseRecord {
  id: string | number;
  [key: string]: any;
}

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

// Общие методы для работы с таблицами
export async function fetchTableData<T>(tableName: string): Promise<ApiResponse<T[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/${tableName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${tableName}`);
    }
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching data from ${tableName}:`, error);
    toast({
      title: "Error",
      description: `Failed to fetch data from ${tableName}`,
      variant: "destructive",
    });
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function createRecord<T extends DatabaseRecord>(
  tableName: string, 
  data: Omit<T, 'id'>
): Promise<ApiResponse<T>> {
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
    
    const result = await response.json();
    
    toast({
      title: "Success",
      description: "Record created successfully",
    });
    
    return { data: result, error: null };
  } catch (error) {
    console.error('Error creating record:', error);
    toast({
      title: "Error",
      description: "Failed to create record",
      variant: "destructive",
    });
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function updateRecord<T extends DatabaseRecord>(
  tableName: string,
  id: string | number,
  data: Partial<T>
): Promise<ApiResponse<T>> {
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
    
    const result = await response.json();
    
    toast({
      title: "Success",
      description: "Record updated successfully",
    });
    
    return { data: result, error: null };
  } catch (error) {
    console.error('Error updating record:', error);
    toast({
      title: "Error",
      description: "Failed to update record",
      variant: "destructive",
    });
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function deleteRecord(
  tableName: string,
  id: string | number
): Promise<ApiResponse<void>> {
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
    
    return { data: null, error: null };
  } catch (error) {
    console.error('Error deleting record:', error);
    toast({
      title: "Error",
      description: "Failed to delete record",
      variant: "destructive",
    });
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

// Специфичные методы для работы с пользователями
export interface User extends DatabaseRecord {
  name: string;
  login: string;
  password?: string;
  department_id?: string;
  dark_theme?: boolean;
  language?: string;
}

export const getUsers = async (): Promise<ApiResponse<User[]>> => {
  return await fetchTableData<User>('users');
};

export const createUser = async (user: Omit<User, 'id'>): Promise<ApiResponse<User>> => {
  return await createRecord<User>('users', user);
};

export const updateUser = async (id: string, user: Partial<User>): Promise<ApiResponse<User>> => {
  return await updateRecord<User>('users', id, user);
};

// Специфичные методы для работы с клиентами
export interface Client extends DatabaseRecord {
  name: string;
  description?: string;
  parent_id?: string;
  agency_id?: string;
  hidden?: boolean;
}

export const getClients = async (): Promise<ApiResponse<Client[]>> => {
  return await fetchTableData<Client>('clients');
};

export const createClient = async (client: Omit<Client, 'id'>): Promise<ApiResponse<Client>> => {
  return await createRecord<Client>('clients', client);
};

export const updateClient = async (id: string, client: Partial<Client>): Promise<ApiResponse<Client>> => {
  return await updateRecord<Client>('clients', id, client);
};

export const deleteClient = async (id: string): Promise<ApiResponse<void>> => {
  return await deleteRecord('clients', id);
};

// Методы для работы с медиа типами
export interface MediaType extends DatabaseRecord {
  name: string;
  description?: string;
}

export const getMediaTypes = async (): Promise<ApiResponse<MediaType[]>> => {
  return await fetchTableData<MediaType>('media_types');
};

export const createMediaType = async (mediaType: Omit<MediaType, 'id'>): Promise<ApiResponse<MediaType>> => {
  return await createRecord<MediaType>('media_types', mediaType);
};

// Методы для работы с отделами
export interface Department extends DatabaseRecord {
  name: string;
  description?: string;
}

export const getDepartments = async (): Promise<ApiResponse<Department[]>> => {
  return await fetchTableData<Department>('departments');
};

export const createDepartment = async (department: Omit<Department, 'id'>): Promise<ApiResponse<Department>> => {
  return await createRecord<Department>('departments', department);
};

export const deleteDepartment = async (id: string): Promise<ApiResponse<void>> => {
  return await deleteRecord('departments', id);
};

