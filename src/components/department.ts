
import { toast } from "@/components/ui/use-toast";

interface Department {
  id: string;
  name: string;
  description?: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const getDepartments = async (): Promise<Department[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/departments`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch departments');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching departments:', error);
    toast({
      title: "Error",
      description: "Failed to fetch departments",
      variant: "destructive",
    });
    return [];
  }
};

export const createDepartment = async (department: { name: string, description?: string }): Promise<Department | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(department),
    });

    if (!response.ok) {
      throw new Error('Failed to create department');
    }

    const data = await response.json();
    toast({
      title: "Success",
      description: "Department created successfully",
    });
    
    return data;
  } catch (error) {
    console.error('Error creating department:', error);
    toast({
      title: "Error",
      description: "Failed to create department",
      variant: "destructive",
    });
    return null;
  }
};

export const deleteDepartment = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/departments/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete department');
    }

    toast({
      title: "Success",
      description: "Department deleted successfully",
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting department:', error);
    toast({
      title: "Error",
      description: "Failed to delete department",
      variant: "destructive",
    });
    return false;
  }
};
