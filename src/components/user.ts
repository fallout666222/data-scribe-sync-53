
import bcrypt from 'bcryptjs';
import { fetchTableData, createRecord, updateRecord, User, ApiResponse } from '../services/databaseApi';

export const getUsers = async () => {
  return await fetchTableData<User[]>('users');
};

export const getUserById = async (id: string): Promise<ApiResponse<User>> => {
  try {
    const response = await fetchTableData<User[]>('users');
    if (response.data) {
      const user = response.data.find(u => u.id === id);
      if (user) {
        return { data: user, error: null };
      }
      return { data: null, error: new Error('User not found') };
    }
    return response;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const createUser = async (user: Omit<User, 'id'>): Promise<ApiResponse<User>> => {
  // Hash the password before storing it
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  
  return await createRecord<User>('users', user);
};

export const updateUser = async (id: string, user: Partial<User>): Promise<ApiResponse<User>> => {
  // If password is being updated, hash it
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  
  return await updateRecord<User>('users', id, user);
};

export const authenticateUser = async (login: string, password: string): Promise<ApiResponse<User>> => {
  try {
    // Get all users to find the one with the matching login
    const { data: users, error: fetchError } = await fetchTableData<User[]>('users');
    
    if (fetchError || !users) {
      console.error('Error fetching users:', fetchError);
      return { data: null, error: fetchError || new Error('Failed to fetch users') };
    }
    
    // Find the user with the matching login
    const user = users.find(u => u.login === login);
    
    if (!user) {
      console.error('User not found');
      return { data: null, error: new Error('Invalid username or password') };
    }
    
    // Check if the password is already hashed (starts with $2a$ or $2b$ for bcrypt)
    const isPasswordHashed = user.password && (
      user.password.startsWith('$2a$') || user.password.startsWith('$2b$')
    );
    
    let isPasswordValid = false;
    
    if (isPasswordHashed && user.password) {
      // If password is hashed, use bcrypt to compare
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else if (user.password) {
      // For legacy non-hashed passwords, do a direct comparison
      isPasswordValid = (password === user.password);
      
      // Optionally, update their password to be hashed for next time
      if (isPasswordValid) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Update the user's password to the hashed version
        await updateRecord('users', user.id.toString(), { password: hashedPassword });
        
        console.log('Updated legacy password to hashed version for user:', user.login);
      }
    }
    
    if (!isPasswordValid) {
      console.error('Invalid password');
      return { data: null, error: new Error('Invalid username or password') };
    }
    
    // Password is valid, return the user
    return { data: user, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? 
        error : 
        new Error('Authentication failed. Please check your connection to the server.')
    };
  }
};

export const getUserSettings = async (userId: string): Promise<ApiResponse<Partial<User>>> => {
  try {
    const response = await getUserById(userId);
    if (response.data) {
      const { dark_theme, language } = response.data;
      return { data: { dark_theme, language }, error: null };
    }
    return response;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const updateUserSettings = async (
  userId: string, 
  settings: { dark_theme?: boolean, language?: string }
): Promise<ApiResponse<Partial<User>>> => {
  try {
    const response = await updateRecord<User>('users', userId, settings);
    if (response.data) {
      const { dark_theme, language } = response.data;
      return { data: { dark_theme, language }, error: null };
    }
    return response;
  } catch (error) {
    console.error('Error updating user settings:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const getUserFirstUnconfirmedWeek = async (userId: string) => {
  try {
    // This would require custom logic that's specific to your application
    // For now, we'll return null
    console.log('getUserFirstUnconfirmedWeek: Not implemented in the new API');
    return null;
  } catch (error) {
    console.error('Error in getUserFirstUnconfirmedWeek:', error);
    return null;
  }
};
