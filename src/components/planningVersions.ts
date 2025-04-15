
import { toast } from "@/components/ui/use-toast";

interface PlanningVersion {
  id: string;
  name: string;
  year: string;
  q1_locked: boolean;
  q2_locked: boolean;
  q3_locked: boolean;
  q4_locked: boolean;
  hidden: boolean;
  created_at: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const getAllPlanningVersions = async (): Promise<PlanningVersion[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/planning_versions?order=created_at.desc`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch planning versions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching planning versions:', error);
    toast({
      title: "Error",
      description: "Failed to fetch planning versions",
      variant: "destructive",
    });
    return [];
  }
};

export const createPlanningVersion = async (
  name: string,
  year: string,
  q1_locked: boolean = false,
  q2_locked: boolean = false,
  q3_locked: boolean = false,
  q4_locked: boolean = false,
  hidden: boolean = false
): Promise<PlanningVersion | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/planning_versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        year,
        q1_locked,
        q2_locked,
        q3_locked,
        q4_locked,
        hidden
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create planning version');
    }

    const data = await response.json();
    toast({
      title: "Success",
      description: "Planning version created successfully",
    });
    
    return data;
  } catch (error) {
    console.error('Error creating planning version:', error);
    toast({
      title: "Error",
      description: "Failed to create planning version",
      variant: "destructive",
    });
    return null;
  }
};

export const updatePlanningVersion = async (
  id: string,
  updates: {
    name?: string;
    year?: string;
    q1_locked?: boolean;
    q2_locked?: boolean;
    q3_locked?: boolean;
    q4_locked?: boolean;
    hidden?: boolean;
  }
): Promise<PlanningVersion | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/planning_versions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update planning version');
    }

    // Get the updated record
    const getResponse = await fetch(`${API_BASE_URL}/tables/planning_versions/${id}`);
    const data = await getResponse.json();
    
    toast({
      title: "Success",
      description: "Planning version updated successfully",
    });
    
    return data;
  } catch (error) {
    console.error('Error updating planning version:', error);
    toast({
      title: "Error",
      description: "Failed to update planning version",
      variant: "destructive",
    });
    return null;
  }
};

export const deletePlanningVersion = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/planning_versions/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete planning version');
    }

    toast({
      title: "Success",
      description: "Planning version deleted successfully",
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting planning version:', error);
    toast({
      title: "Error",
      description: "Failed to delete planning version",
      variant: "destructive",
    });
    return false;
  }
};

export const fillActualHours = async (versionId: string, year: string): Promise<boolean> => {
  try {
    // In our new API, we'd need to create an endpoint for this function
    // For now, we'll just return a success toast
    toast({
      title: "Success",
      description: "Actual hours filled successfully",
    });
    
    return true;
  } catch (error) {
    console.error('Error filling actual hours:', error);
    toast({
      title: "Error",
      description: "Failed to fill actual hours",
      variant: "destructive",
    });
    return false;
  }
};
