
import { toast } from "@/components/ui/use-toast";

export interface YearData {
  id?: string;
  year: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const getAllYears = async (): Promise<YearData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/years?order=year.desc`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch years');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching years:', error);
    toast({
      title: "Error",
      description: "Failed to fetch years",
      variant: "destructive",
    });
    return [];
  }
};

export const getYearByName = async (yearName: string): Promise<YearData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/years?year=eq.${yearName}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch year ${yearName}`);
    }
    
    const years = await response.json();
    return years.length > 0 ? years[0] : null;
  } catch (error) {
    console.error(`Error fetching year ${yearName}:`, error);
    toast({
      title: "Error",
      description: `Failed to fetch year ${yearName}`,
      variant: "destructive",
    });
    return null;
  }
};

export const createYear = async (yearData: YearData): Promise<YearData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/years`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(yearData),
    });

    if (!response.ok) {
      throw new Error('Failed to create year');
    }

    const data = await response.json();
    toast({
      title: "Success",
      description: "Year created successfully",
    });
    
    return data;
  } catch (error) {
    console.error('Error creating year:', error);
    toast({
      title: "Error",
      description: "Failed to create year",
      variant: "destructive",
    });
    return null;
  }
};

export const updateYear = async (id: string, yearData: Partial<YearData>): Promise<YearData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/years/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(yearData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update year with id ${id}`);
    }

    // Get the updated record
    const getResponse = await fetch(`${API_BASE_URL}/tables/years/${id}`);
    const data = await getResponse.json();
    
    toast({
      title: "Success",
      description: "Year updated successfully",
    });
    
    return data;
  } catch (error) {
    console.error(`Error updating year with id ${id}:`, error);
    toast({
      title: "Error",
      description: `Failed to update year with id ${id}`,
      variant: "destructive",
    });
    return null;
  }
};

export const deleteYear = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/years/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete year with id ${id}`);
    }

    toast({
      title: "Success",
      description: "Year deleted successfully",
    });
    
    return true;
  } catch (error) {
    console.error(`Error deleting year with id ${id}:`, error);
    toast({
      title: "Error",
      description: `Failed to delete year with id ${id}`,
      variant: "destructive",
    });
    return false;
  }
};
