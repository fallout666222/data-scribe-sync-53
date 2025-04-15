
import { toast } from "@/components/ui/use-toast";
import * as bcrypt from 'bcryptjs';

interface User {
  id: string;
  name: string;
  login: string;
  password: string;
  department_id?: string;
  deletion_mark: boolean;
  dark_theme?: boolean;
  language?: string;
}

interface Department {
  name: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/users?deletion_mark=eq.false`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const users = await response.json();
    
    // Get all department IDs from users
    const departmentIds = [...new Set(users.filter((u: User) => u.department_id).map((u: User) => u.department_id))];
    
    // Fetch all departments in one request if there are any department IDs
    let departments: any[] = [];
    if (departmentIds.length > 0) {
      const departmentsResponse = await fetch(`${API_BASE_URL}/tables/departments?id=in.(${departmentIds.join(',')})`);
      if (departmentsResponse.ok) {
        departments = await departmentsResponse.json();
      }
    }
    
    // Attach department data to each user
    return users.map((user: User) => ({
      ...user,
      department: user.department_id ? departments.find(d => d.id === user.department_id) : null
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    toast({
      title: "Error",
      description: "Failed to fetch users",
      variant: "destructive",
    });
    return [];
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user with id ${id}`);
    }
    
    const user = await response.json();
    
    // Get department data if the user has a department_id
    if (user.department_id) {
      const departmentResponse = await fetch(`${API_BASE_URL}/tables/departments/${user.department_id}`);
      if (departmentResponse.ok) {
        const department = await departmentResponse.json();
        user.department = { name: department.name };
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    toast({
      title: "Error",
      description: `Failed to fetch user with id ${id}`,
      variant: "destructive",
    });
    return null;
  }
};

export const createUser = async (user: any): Promise<User | null> => {
  try {
    // Hash the password before storing it
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
    
    const response = await fetch(`${API_BASE_URL}/tables/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    const data = await response.json();
    toast({
      title: "Success",
      description: "User created successfully",
    });
    
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    toast({
      title: "Error",
      description: "Failed to create user",
      variant: "destructive",
    });
    return null;
  }
};

export const updateUser = async (id: string, user: any): Promise<User | null> => {
  try {
    // If password is being updated, hash it
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
    
    const response = await fetch(`${API_BASE_URL}/tables/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user with id ${id}`);
    }

    // Get the updated record
    const getResponse = await fetch(`${API_BASE_URL}/tables/users/${id}`);
    const data = await getResponse.json();
    
    toast({
      title: "Success",
      description: "User updated successfully",
    });
    
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    toast({
      title: "Error",
      description: `Failed to update user with id ${id}`,
      variant: "destructive",
    });
    return null;
  }
};

export const authenticateUser = async (login: string, password: string): Promise<{ data: User | null, error: { message: string } | null }> => {
  try {
    // Get the user by login
    const response = await fetch(`${API_BASE_URL}/tables/users?login=eq.${login}`);
    
    if (!response.ok) {
      console.error('Failed to fetch user for authentication');
      return { data: null, error: { message: 'Invalid username or password' } };
    }
    
    const users = await response.json();
    
    if (users.length === 0) {
      console.error('User not found');
      return { data: null, error: { message: 'Invalid username or password' } };
    }
    
    const user = users[0];
    
    // Check if the password is already hashed (starts with $2a$ or $2b$ for bcrypt)
    const isPasswordHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
    
    let isPasswordValid = false;
    
    if (isPasswordHashed) {
      // If password is hashed, use bcrypt to compare
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // For legacy non-hashed passwords, do a direct comparison
      // This allows users with old passwords to still log in
      isPasswordValid = (password === user.password);
      
      // Optionally, update their password to be hashed for next time
      if (isPasswordValid) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Update the user's password to the hashed version
        await fetch(`${API_BASE_URL}/tables/users/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: hashedPassword }),
        });
        
        console.log('Updated legacy password to hashed version for user:', user.login);
      }
    }
    
    if (!isPasswordValid) {
      console.error('Invalid password');
      return { data: null, error: { message: 'Invalid username or password' } };
    }
    
    // Password is valid, return the user
    return { data: user, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return { data: null, error: { message: 'Authentication failed. Please check your connection to the server.' } };
  }
};

export const getUserSettings = async (userId: string): Promise<{ dark_theme?: boolean, language?: string } | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch settings for user ${userId}`);
    }
    
    const user = await response.json();
    return { dark_theme: user.dark_theme, language: user.language };
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
};

export const updateUserSettings = async (userId: string, settings: { dark_theme?: boolean, language?: string }): Promise<{ dark_theme?: boolean, language?: string } | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`Failed to update settings for user ${userId}`);
    }

    // Get the updated record
    const getResponse = await fetch(`${API_BASE_URL}/tables/users/${userId}`);
    const user = await getResponse.json();
    
    return { dark_theme: user.dark_theme, language: user.language };
  } catch (error) {
    console.error('Error updating user settings:', error);
    return null;
  }
};

export const getUserFirstUnconfirmedWeek = async (userId: string): Promise<any | null> => {
  try {
    // Get week statuses that are either unconfirmed or needs-revision
    const statusNamesResponse = await fetch(`${API_BASE_URL}/tables/week_status_names?name=in.(unconfirmed,needs-revision)`);
    
    if (!statusNamesResponse.ok) {
      throw new Error('Failed to fetch week status names');
    }
    
    const statusNames = await statusNamesResponse.json();
    
    if (!statusNames || statusNames.length === 0) {
      return null;
    }
    
    const statusIds = statusNames.map((status: any) => status.id);
    
    // Find the first week with these statuses
    const weekStatusesResponse = await fetch(
      `${API_BASE_URL}/tables/week_statuses?user_id=eq.${userId}&week_status_id=in.(${statusIds.join(',')})&order=created_at.asc`
    );
    
    if (!weekStatusesResponse.ok) {
      throw new Error('Failed to fetch week statuses');
    }
    
    const weekStatuses = await weekStatusesResponse.json();
    
    if (weekStatuses.length === 0) {
      return null;
    }
    
    // Get the week data for the first unconfirmed week status
    const weekId = weekStatuses[0].week_id;
    const weekResponse = await fetch(`${API_BASE_URL}/tables/custom_weeks/${weekId}`);
    
    if (!weekResponse.ok) {
      throw new Error(`Failed to fetch week with id ${weekId}`);
    }
    
    return await weekResponse.json();
  } catch (error) {
    console.error('Error fetching user first unconfirmed week:', error);
    return null;
  }
};
