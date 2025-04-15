
import { toast } from "@/components/ui/use-toast";

interface CustomWeek {
  id: string;
  name: string;
  period_from: string;
  period_to: string;
  required_hours: number;
}

interface WeekStatus {
  id: string;
  user_id: string;
  week_id: string;
  week_status_id: string;
  created_at: string;
  week?: CustomWeek;
  status?: any;
}

interface WeekPercentage {
  id: string;
  user_id: string;
  week_id: string;
  percentage: number;
  week?: CustomWeek;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const getCustomWeeks = async (): Promise<CustomWeek[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/custom_weeks?order=period_from.asc`);
    
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

// Week Status Names
export const getWeekStatusNames = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/week_status_names`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch week status names');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching week status names:', error);
    toast({
      title: "Error",
      description: "Failed to fetch week status names",
      variant: "destructive",
    });
    return [];
  }
};

// Week Statuses
export const getWeekStatuses = async (userId: string): Promise<WeekStatus[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/week_statuses?user_id=eq.${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch week statuses');
    }
    
    const weekStatuses = await response.json();
    
    // Get all week IDs and status IDs from week statuses
    const weekIds = [...new Set(weekStatuses.map((ws: WeekStatus) => ws.week_id))];
    const statusIds = [...new Set(weekStatuses.map((ws: WeekStatus) => ws.week_status_id))];
    
    // Fetch all weeks in one request
    let weeks: any[] = [];
    if (weekIds.length > 0) {
      const weeksResponse = await fetch(`${API_BASE_URL}/tables/custom_weeks?id=in.(${weekIds.join(',')})`);
      if (weeksResponse.ok) {
        weeks = await weeksResponse.json();
      }
    }
    
    // Fetch all status names in one request
    let statusNames: any[] = [];
    if (statusIds.length > 0) {
      const statusNamesResponse = await fetch(`${API_BASE_URL}/tables/week_status_names?id=in.(${statusIds.join(',')})`);
      if (statusNamesResponse.ok) {
        statusNames = await statusNamesResponse.json();
      }
    }
    
    // Attach week and status data to each week status
    return weekStatuses.map((ws: WeekStatus) => ({
      ...ws,
      week: weeks.find(w => w.id === ws.week_id),
      status: statusNames.find(s => s.id === ws.week_status_id)
    }));
  } catch (error) {
    console.error('Error fetching week statuses:', error);
    toast({
      title: "Error",
      description: "Failed to fetch week statuses",
      variant: "destructive",
    });
    return [];
  }
};

export const getWeekStatusesChronological = async (userId: string): Promise<WeekStatus[]> => {
  try {
    const weekStatuses = await getWeekStatuses(userId);
    
    // Sort by week's period_from date if data exists
    return weekStatuses.sort((a: WeekStatus, b: WeekStatus) => {
      if (!a.week || !b.week) return 0;
      
      const dateA = new Date(a.week.period_from);
      const dateB = new Date(b.week.period_from);
      return dateA.getTime() - dateB.getTime();
    });
  } catch (error) {
    console.error('Error fetching chronological week statuses:', error);
    toast({
      title: "Error",
      description: "Failed to fetch week statuses",
      variant: "destructive",
    });
    return [];
  }
};

export const updateWeekStatus = async (userId: string, weekId: string, statusId: string): Promise<WeekStatus | null> => {
  try {
    // Check if status already exists
    const checkResponse = await fetch(
      `${API_BASE_URL}/tables/week_statuses?user_id=eq.${userId}&week_id=eq.${weekId}`
    );
    
    if (!checkResponse.ok) {
      throw new Error('Failed to check existing week status');
    }
    
    const existingEntries = await checkResponse.json();
    const existingEntry = existingEntries.length > 0 ? existingEntries[0] : null;
    
    if (existingEntry) {
      const updateResponse = await fetch(`${API_BASE_URL}/tables/week_statuses/${existingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ week_status_id: statusId }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update week status');
      }
      
      // Get the updated record
      const getResponse = await fetch(`${API_BASE_URL}/tables/week_statuses/${existingEntry.id}`);
      return await getResponse.json();
    } else {
      const createResponse = await fetch(`${API_BASE_URL}/tables/week_statuses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, week_id: weekId, week_status_id: statusId }),
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create week status');
      }
      
      return await createResponse.json();
    }
  } catch (error) {
    console.error('Error updating week status:', error);
    toast({
      title: "Error",
      description: "Failed to update week status",
      variant: "destructive",
    });
    return null;
  }
};

// Week Percentages
export const getWeekPercentages = async (userId: string): Promise<WeekPercentage[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/week_percentages?user_id=eq.${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch week percentages');
    }
    
    const weekPercentages = await response.json();
    
    // Get all week IDs from week percentages
    const weekIds = [...new Set(weekPercentages.map((wp: WeekPercentage) => wp.week_id))];
    
    // Fetch all weeks in one request
    let weeks: any[] = [];
    if (weekIds.length > 0) {
      const weeksResponse = await fetch(`${API_BASE_URL}/tables/custom_weeks?id=in.(${weekIds.join(',')})`);
      if (weeksResponse.ok) {
        weeks = await weeksResponse.json();
      }
    }
    
    // Attach week data to each week percentage
    return weekPercentages.map((wp: WeekPercentage) => ({
      ...wp,
      week: weeks.find(w => w.id === wp.week_id)
    }));
  } catch (error) {
    console.error('Error fetching week percentages:', error);
    toast({
      title: "Error",
      description: "Failed to fetch week percentages",
      variant: "destructive",
    });
    return [];
  }
};

export const updateWeekPercentage = async (userId: string, weekId: string, percentage: number): Promise<WeekPercentage | null> => {
  try {
    // Check if percentage already exists
    const checkResponse = await fetch(
      `${API_BASE_URL}/tables/week_percentages?user_id=eq.${userId}&week_id=eq.${weekId}`
    );
    
    if (!checkResponse.ok) {
      throw new Error('Failed to check existing week percentage');
    }
    
    const existingEntries = await checkResponse.json();
    const existingEntry = existingEntries.length > 0 ? existingEntries[0] : null;
    
    if (existingEntry) {
      const updateResponse = await fetch(`${API_BASE_URL}/tables/week_percentages/${existingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ percentage }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update week percentage');
      }
      
      // Get the updated record
      const getResponse = await fetch(`${API_BASE_URL}/tables/week_percentages/${existingEntry.id}`);
      return await getResponse.json();
    } else {
      const createResponse = await fetch(`${API_BASE_URL}/tables/week_percentages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, week_id: weekId, percentage }),
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create week percentage');
      }
      
      return await createResponse.json();
    }
  } catch (error) {
    console.error('Error updating week percentage:', error);
    toast({
      title: "Error",
      description: "Failed to update week percentage",
      variant: "destructive",
    });
    return null;
  }
};
