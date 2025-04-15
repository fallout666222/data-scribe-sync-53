
import { toast } from "@/components/ui/use-toast";

interface CustomWeek {
  id: string;
  name: string;
  period_from: string;
  period_to: string;
  required_hours: number;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const getCustomWeeks = async (): Promise<CustomWeek[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/custom_weeks`);
    if (!response.ok) {
      throw new Error('Failed to fetch custom weeks');
    }
    const data = await response.json();
    // Sort by period_from ascending
    return data.sort((a: CustomWeek, b: CustomWeek) => 
      new Date(a.period_from).getTime() - new Date(b.period_from).getTime()
    );
  } catch (error) {
    console.error('Error fetching custom weeks:', error);
    toast({
      title: "Error",
      description: "Failed to fetch custom weeks",
      variant: "destructive",
    });
    return [];
  }
};

export const createCustomWeek = async (week: Omit<CustomWeek, 'id'>): Promise<CustomWeek | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/custom_weeks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(week),
    });

    if (!response.ok) {
      throw new Error('Failed to create custom week');
    }

    const data = await response.json();
    toast({
      title: "Success",
      description: "Custom week created successfully",
    });
    
    return data;
  } catch (error) {
    console.error('Error creating custom week:', error);
    toast({
      title: "Error",
      description: "Failed to create custom week",
      variant: "destructive",
    });
    return null;
  }
};

